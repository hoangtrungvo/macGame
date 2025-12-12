import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as IOServer } from 'socket.io';
import { GameState, GameAction } from './types';
import { readGames, updateGame, updateRoom, readRooms } from './lib/database';
import { joinRoom, leaveRoom, getAllRooms } from './lib/roomManager';
import { applyCardEffect, calculateScore, generateCard } from './lib/gameLogic';
import { updateLeaderboard } from './lib/leaderboard';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  const io = new IOServer(server, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Request current game state for a room
    socket.on('request-game-state', async (data: { roomId: string }) => {
      const rooms = await readRooms();
      const room = rooms.find(r => r.id === data.roomId);
      
      if (room && room.gameState) {
        socket.join(data.roomId);
        socket.emit('game-update', room.gameState);
      } else {
        socket.emit('error', 'Room or game not found');
      }
    });

    // Send initial rooms list
    socket.on('request-rooms', async () => {
      const rooms = await getAllRooms();
      socket.emit('rooms-update', rooms);
    });

    // Join room
    socket.on('join-room', async (data: { roomId: string; playerName: string }) => {
      console.log('Received join-room request:', data, 'from socket:', socket.id);
      const result = await joinRoom(data.roomId, data.playerName);
      
      console.log('Join room result:', { success: result.success, playerId: result.player?.id, error: result.error });
      
      if (result.success && result.player && result.room) {
        socket.join(data.roomId);
        console.log('Emitting player-joined to socket:', socket.id, 'with data:', { roomId: data.roomId, playerId: result.player.id });
        // Emit to the player who just joined
        socket.emit('player-joined', { 
          roomId: data.roomId, 
          playerId: result.player.id 
        });
        // Broadcast game update to all players in the room
        io.to(data.roomId).emit('game-update', result.room.gameState);
        
        // Update rooms list for all clients
        const rooms = await getAllRooms();
        io.emit('rooms-update', rooms);
      } else {
        console.log('Join room failed, emitting error:', result.error);
        socket.emit('error', result.error || 'Failed to join room');
      }
    });

    // Leave room
    socket.on('leave-room', async (data: { roomId: string; playerId: string }) => {
      const result = await leaveRoom(data.roomId, data.playerId);
      
      if (result.success) {
        socket.leave(data.roomId);
        io.to(data.roomId).emit('player-left', data.playerId);
        
        const rooms = await getAllRooms();
        io.emit('rooms-update', rooms);
      }
    });

    // Player ready
    socket.on('player-ready', async (data: { roomId: string; playerId: string }) => {
      const rooms = await readRooms();
      const room = rooms.find(r => r.id === data.roomId);
      
      if (room && room.gameState) {
        const player = room.gameState.players.find(p => p.id === data.playerId);
        if (player) {
          player.ready = true;
          
          const allReady = room.gameState.players.every(p => p.ready);
          
          if (allReady && room.gameState.status === 'waiting') {
            room.gameState.status = 'active';
            room.gameState.startTime = Date.now();
            room.status = 'in-progress';
            
            await updateRoom(data.roomId, { status: room.status, gameState: room.gameState });
            await updateGame(room.gameState.id, { status: 'active', startTime: room.gameState.startTime });
            
            io.to(data.roomId).emit('game-started', room.gameState);
          } else {
            // Update room even if not all ready yet
            await updateRoom(data.roomId, { gameState: room.gameState });
          }
          
          io.to(data.roomId).emit('game-update', room.gameState);
        }
      }
    });

    // Play card
    socket.on('play-card', async (data: { roomId: string; playerId: string; cardId: string; answer: string }) => {
      const rooms = await readRooms();
      const room = rooms.find(r => r.id === data.roomId);
      
      if (!room || !room.gameState) {
        socket.emit('error', 'Game not found');
        return;
      }
      
      const gameState = room.gameState;
      const player = gameState.players.find(p => p.id === data.playerId);
      
      if (!player) {
        socket.emit('error', 'Player not found');
        return;
      }
      
      if (player.team !== gameState.currentTurn) {
        socket.emit('error', 'Not your turn');
        return;
      }
      
      const cardIndex = player.cards.findIndex(c => c.id === data.cardId);
      if (cardIndex === -1) {
        socket.emit('error', 'Card not found');
        return;
      }
      
      const card = player.cards[cardIndex];
      
      // Validate answer (case-insensitive)
      const isCorrect = card.correctAnswer.toLowerCase().trim() === data.answer.toLowerCase().trim();
      
      if (!isCorrect) {
        socket.emit('error', `❌ Sai rồi! Đáp án đúng là: ${card.correctAnswer}`);
        return;
      }
      
      // Answer is correct - apply card effect
      player.cards.splice(cardIndex, 1);
      
      const isAttack = card.value < 0;
      const target = isAttack
        ? gameState.players.find(p => p.team !== player.team)!
        : player;
      
      const result = applyCardEffect(target.health, target.maxHealth, card);
      target.health = result.newHealth;
      
      const action: GameAction = {
        playerId: player.id,
        playerName: player.name,
        team: player.team,
        action: 'play-card',
        card,
        timestamp: Date.now(),
        effect: result.effectDescription,
      };
      
      gameState.history.push(action);
      
      if (target.health <= 0) {
        gameState.status = 'finished';
        gameState.winner = player.team;
        gameState.endTime = Date.now();
        room.status = 'finished';
        
        const gameDuration = gameState.endTime - (gameState.startTime || gameState.endTime);
        
        for (const p of gameState.players) {
          const won = p.team === gameState.winner;
          const score = calculateScore(won, p.health, gameState.history.filter(h => h.playerId === p.id).length, gameDuration);
          p.score = score;
          
          const damageDealt = gameState.history
            .filter(h => h.playerId === p.id && h.card && h.card.value < 0)
            .reduce((sum, h) => sum + Math.abs(h.card!.value), 0);
          
          await updateLeaderboard(p.name, won, score, damageDealt);
        }
        
        await updateRoom(data.roomId, { status: room.status, gameState });
        await updateGame(gameState.id, gameState);
        
        io.to(data.roomId).emit('game-ended', { winner: gameState.winner, gameState });
      } else {
        gameState.currentTurn = gameState.currentTurn === 'red' ? 'blue' : 'red';
        gameState.turnNumber += 1;
        
        await updateRoom(data.roomId, { gameState });
        await updateGame(gameState.id, gameState);
        
        io.to(data.roomId).emit('card-played', action);
        io.to(data.roomId).emit('turn-changed', gameState.currentTurn);
      }
      
      io.to(data.roomId).emit('game-update', gameState);
      
      const allRooms = await getAllRooms();
      io.emit('rooms-update', allRooms);
    });

    // Draw card
    socket.on('draw-card', async (data: { roomId: string; playerId: string; cardType?: string }) => {
      const rooms = await readRooms();
      const room = rooms.find(r => r.id === data.roomId);
      
      if (!room || !room.gameState) {
        socket.emit('error', 'Game not found');
        return;
      }
      
      const gameState = room.gameState;
      const player = gameState.players.find(p => p.id === data.playerId);
      
      if (!player) {
        socket.emit('error', 'Player not found');
        return;
      }
      
      if (player.team !== gameState.currentTurn) {
        socket.emit('error', 'Not your turn');
        return;
      }
      
      // Generate a new card with specified type or random
      const newCard = generateCard(data.cardType as any);
      player.cards.push(newCard);
      
      // Drawing a card counts as a turn
      gameState.currentTurn = gameState.currentTurn === 'red' ? 'blue' : 'red';
      gameState.turnNumber += 1;
      
      await updateRoom(data.roomId, { gameState });
      await updateGame(gameState.id, gameState);
      
      io.to(data.roomId).emit('turn-changed', gameState.currentTurn);
      io.to(data.roomId).emit('game-update', gameState);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  server
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server running on path: /api/socket`);
    });
});

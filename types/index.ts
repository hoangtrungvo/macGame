// Card types based on the game design
export type CardType = 'defense' | 'heal' | 'attack' | 'thunder' | 'detox';

export interface Card {
  id: string;
  type: CardType;
  name: string;
  value: number; // Positive for heal/defense, negative for attack
  description: string;
  color: string; // For UI styling
  icon: string; // Icon identifier
  question: string; // Câu hỏi người chơi phải trả lời
  correctAnswer: string; // Đáp án đúng (case-insensitive)
  options?: string[]; // Các lựa chọn (optional, có thể dùng multiple choice hoặc text input)
}

// Player in a game
export interface Player {
  id: string;
  name: string;
  team: 'red' | 'blue'; // Đội Đỏ or Đội Xanh
  health: number;
  maxHealth: number;
  cards: Card[];
  score: number;
  ready: boolean;
}

// Game state
export interface GameState {
  id: string;
  roomId: string;
  players: Player[];
  currentTurn: 'red' | 'blue';
  turnNumber: number;
  status: 'waiting' | 'active' | 'finished';
  winner: 'red' | 'blue' | null;
  startTime: number | null;
  endTime: number | null;
  history: GameAction[];
}

// Game action for history tracking
export interface GameAction {
  playerId: string;
  playerName: string;
  team: 'red' | 'blue';
  action: 'play-card' | 'skip-turn';
  card?: Card;
  timestamp: number;
  effect: string; // Description of what happened
}

// Room for multiplayer
export interface Room {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: 2;
  status: 'waiting' | 'in-progress' | 'finished';
  gameState: GameState | null;
  createdAt: number;
}

// Leaderboard entry
export interface LeaderboardEntry {
  playerName: string;
  wins: number;
  score: number;
  timeFinished: number; // Timestamp of last win
  gamesPlayed: number;
  totalDamageDealt: number;
}

// Admin configuration
export interface AdminConfig {
  maxRooms: number;
  defaultPlayerHealth: number;
  cardsPerPlayer: number;
  enableLeaderboard: boolean;
}

// WebSocket event types
export interface SocketEvents {
  // Client to Server
  'join-room': (data: { roomId: string; playerName: string }) => void;
  'leave-room': (data: { roomId: string; playerId: string }) => void;
  'play-card': (data: { roomId: string; playerId: string; cardId: string; answer: string }) => void;
  'draw-card': (data: { roomId: string; playerId: string }) => void;
  'player-ready': (data: { roomId: string; playerId: string }) => void;
  'request-rooms': () => void;
  
  // Server to Client
  'rooms-update': (rooms: Room[]) => void;
  'game-update': (gameState: GameState) => void;
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'game-started': (gameState: GameState) => void;
  'game-ended': (result: { winner: 'red' | 'blue'; gameState: GameState }) => void;
  'error': (message: string) => void;
  'turn-changed': (turn: 'red' | 'blue') => void;
  'card-played': (action: GameAction) => void;
}

// Database structure
export interface Database {
  rooms: Room[];
  games: GameState[];
  leaderboard: LeaderboardEntry[];
  config: AdminConfig;
}

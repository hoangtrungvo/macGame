import { LeaderboardEntry } from '@/types';
import { readLeaderboard, writeLeaderboard } from './database';

export async function updateLeaderboard(
  playerName: string,
  won: boolean,
  score: number,
  damageDealt: number
): Promise<void> {
  const leaderboard = await readLeaderboard();
  
  const existingEntry = leaderboard.find(entry => entry.playerName === playerName);
  
  if (existingEntry) {
    existingEntry.gamesPlayed += 1;
    existingEntry.totalDamageDealt += damageDealt;
    
    if (won) {
      existingEntry.wins += 1;
      existingEntry.score += score;
      existingEntry.timeFinished = Date.now();
    }
  } else {
    const newEntry: LeaderboardEntry = {
      playerName,
      wins: won ? 1 : 0,
      score: won ? score : 0,
      timeFinished: won ? Date.now() : 0,
      gamesPlayed: 1,
      totalDamageDealt: damageDealt,
    };
    leaderboard.push(newEntry);
  }
  
  await writeLeaderboard(leaderboard);
}

export async function getLeaderboard(limit?: number): Promise<LeaderboardEntry[]> {
  const leaderboard = await readLeaderboard();
  
  // Sort by score descending, then by time finished
  const sorted = leaderboard.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    return b.timeFinished - a.timeFinished;
  });
  
  return limit ? sorted.slice(0, limit) : sorted;
}

export async function getPlayerStats(playerName: string): Promise<LeaderboardEntry | null> {
  const leaderboard = await readLeaderboard();
  return leaderboard.find(entry => entry.playerName === playerName) || null;
}

import { NextResponse } from 'next/server';
import { writeLeaderboard } from '@/lib/database';

export async function DELETE() {
  try {
    // Reset leaderboard to empty array
    await writeLeaderboard([]);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Leaderboard has been reset successfully' 
    });
  } catch (error) {
    console.error('Error resetting leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset leaderboard' },
      { status: 500 }
    );
  }
}

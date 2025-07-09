import { BaseApiService } from './base-api.ts';
import { SingleResponse } from './types.ts';

export interface MatchStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface Match {
  id: number;
  player1_id: number;
  player2_id: number;
  player1_alias: string;
  player2_alias: string;
  winner_id: number;
  player1_score: number;
  player2_score: number;
  played_at: string;
  player1_name: string;
  player1_username: string;
  player2_name: string;
  player2_username: string;
  winner_name: string;
  winner_username: string;
}

export class MatchesService extends BaseApiService {
  // Get player statistics
  async getPlayerStats(playerId: number): Promise<SingleResponse<MatchStats>> {
    return this.request<SingleResponse<MatchStats>>(`/matches/player/${playerId}/stats`);
  }

  // Get bulk user statistics for multiple users
  async getBulkUserStats(userIds: number[]): Promise<SingleResponse<Record<number, MatchStats>>> {
    return this.request<SingleResponse<Record<number, MatchStats>>>('/matches/bulk-stats', {
      method: 'POST',
      body: JSON.stringify({ userIds })
    });
  }

  // Get matches for a specific player
  async getPlayerMatches(playerId: number): Promise<SingleResponse<Match[]>> {
    return this.request<SingleResponse<Match[]>>(`/matches/player/${playerId}`);
  }
}

// Export a singleton instance
export const matchesService = new MatchesService();

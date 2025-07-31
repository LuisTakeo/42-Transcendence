import { BaseApiService } from './base-api.ts';
import { PaginatedResponse, SimpleResponse, SingleResponse } from './types.ts';
import { Match } from './matches.service.ts';

export interface Tournament {
  id?: number;
  name: string;
  owner_id: number;
  owner_username?: string;
  status?: 'pending' | 'ongoing' | 'finished';
  created_at?: string;
}

export interface TournamentPlayer {
  tournament_id: number;
  user_id: number;
  username: string;
  name: string;
  points: number;
}

export interface TournamentDetail extends Tournament {
  players: TournamentPlayer[];
  matches: Match[];
}

export interface TournamentRanking {
  tournament_id: number;
  user_id: number;
  username: string;
  name: string;
  points: number;
  victories: number;
  diff: number;
  made: number;
}

export class TournamentsService extends BaseApiService {
  // Get all tournaments
  async getAllTournaments(): Promise<SimpleResponse<Tournament[]>> {
    return this.request<SimpleResponse<Tournament[]>>('/tournaments');
  }

  // Get active tournaments
  async getActiveTournaments(): Promise<SimpleResponse<Tournament[]>> {
    return this.request<SimpleResponse<Tournament[]>>('/tournaments/active');
  }

  // Get tournament by ID
  async getTournamentById(id: number): Promise<SingleResponse<TournamentDetail>> {
    return this.request<SingleResponse<TournamentDetail>>(`/tournaments/${id}`);
  }

  // Create new tournament
  async createTournament(data: { name: string; owner_id: number }): Promise<SingleResponse<Tournament>> {
    return this.request<SingleResponse<Tournament>>('/tournaments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
  }

  // Join tournament
  async joinTournament(tournamentId: number, data: { user_id: number }): Promise<SingleResponse<{ message: string }>> {
    return this.request<SingleResponse<{ message: string }>>(`/tournaments/${tournamentId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
  }

  // Start tournament
  async startTournament(tournamentId: number): Promise<SingleResponse<{ message: string }>> {
    return this.request<SingleResponse<{ message: string }>>(`/tournaments/${tournamentId}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  // Get user tournaments
  async getUserTournaments(userId: number): Promise<SimpleResponse<(Tournament & { user_role: 'owner' | 'player' })[]>> {
    return this.request<SimpleResponse<(Tournament & { user_role: 'owner' | 'player' })[]>>(`/tournaments/user/${userId}`);
  }

  // Get final ranking by calculating from tournament data
  async getFinalRanking(tournamentId: number): Promise<SimpleResponse<TournamentRanking>> {
    const tournamentResponse = await this.getTournamentById(tournamentId);

    if (!tournamentResponse.success || !tournamentResponse.data) {
      return { success: false, data: [], count: 0 };
    }

    const { matches } = tournamentResponse.data;

    // Initialize ranking map
    const rankingMap: Record<string, TournamentRanking> = {};

    // Populate ranking map with players based on aliases in matches
    matches.forEach(match => {
      if (!rankingMap[match.player1_alias]) {
        rankingMap[match.player1_alias] = {
          tournament_id: tournamentId,
          user_id: 0, // No user_id available, using 0 as placeholder
          username: match.player1_alias,
          name: match.player1_alias,
          points: 0,
          victories: 0,
          diff: 0,
          made: 0
        };
      }

      if (!rankingMap[match.player2_alias]) {
        rankingMap[match.player2_alias] = {
          tournament_id: tournamentId,
          user_id: 0, // No user_id available, using 0 as placeholder
          username: match.player2_alias,
          name: match.player2_alias,
          points: 0,
          victories: 0,
          diff: 0,
          made: 0
        };
      }
    });
    console.log(matches);
    // Process matches to calculate ranking
    matches.forEach(match => {
      const winner = rankingMap[match.winner_username];
      const player1 = rankingMap[match.player1_alias];
      const player2 = rankingMap[match.player2_alias];
      console.log(winner, player1, player2);
      if (winner) {
        winner.victories += 1;
        winner.points += 1; // 1 point per victory
      }

      if (player1) {
        player1.made += match.player1_score;
        player1.diff += match.player1_score - match.player2_score;
      }

      if (player2) {
        player2.made += match.player2_score;
        player2.diff += match.player2_score - match.player1_score;
      }
    });

    // Convert ranking map to array and sort by points, victories, and diff
    const ranking = Object.values(rankingMap).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.victories !== a.victories) return b.victories - a.victories;
      return b.diff - a.diff;
    });
    console.log(ranking);
    return { success: true, data: ranking, count: ranking.length };
  }
}

// Export a singleton instance
export const tournamentsService = new TournamentsService();

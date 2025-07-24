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

  // Get final ranking
  async getFinalRanking(tournamentId: number): Promise<SimpleResponse<TournamentRanking[]>> {
    return this.request<SimpleResponse<TournamentRanking[]>>(`/tournaments/${tournamentId}/final-ranking`);
  }
}

// Export a singleton instance
export const tournamentsService = new TournamentsService();

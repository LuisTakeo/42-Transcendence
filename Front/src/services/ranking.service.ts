import { BaseApiService } from './base-api.ts';
import { usersService } from './users.service.ts';
import { matchesService } from './matches.service.ts';
import { SimpleResponse } from './types.ts';

export interface RankingUser {
  position: number;
  id: number;
  username: string;
  name: string;
  totalMatches: number;
  wins: number;
  winRate: number;
}

export class RankingService extends BaseApiService {
  // Get all users ranked by their performance
  async getRanking(): Promise<SimpleResponse<RankingUser>> {
    try {
      // Get all users
      const usersResponse = await usersService.getAllUsers();

      if (!usersResponse.success || !usersResponse.data) {
        throw new Error('Failed to fetch users');
      }

      const users = usersResponse.data;

      // Get stats for each user
      const rankingUsers: RankingUser[] = await Promise.all(users.map(async (user) => {
        try {
          const statsResponse = await matchesService.getPlayerStats(user.id);
          const stats = statsResponse.success ? statsResponse.data : {
            totalMatches: 0,
            wins: 0,
            losses: 0,
            winRate: 0
          };

          return {
            position: 0, // Will be set after sorting
            id: user.id,
            username: user.username,
            name: user.name,
            totalMatches: stats.totalMatches,
            wins: stats.wins,
            winRate: stats.winRate
          };
        } catch (error) {
          // If stats fail, add user with zero stats
          console.warn(`Failed to get stats for user ${user.id}:`, error);
          return {
            position: 0,
            id: user.id,
            username: user.username,
            name: user.name,
            totalMatches: 0,
            wins: 0,
            winRate: 0
          };
        }
      }));

      // Sort by win rate (descending), then by total wins (descending), then by total matches (descending)
      rankingUsers.sort((a, b) => {
        if (b.winRate !== a.winRate) {
          return b.winRate - a.winRate;
        }
        if (b.wins !== a.wins) {
          return b.wins - a.wins;
        }
        return b.totalMatches - a.totalMatches;
      });

      // Set positions
      rankingUsers.forEach((user, index) => {
        user.position = index + 1;
      });

      return {
        success: true,
        data: rankingUsers,
        count: rankingUsers.length
      };
    } catch (error) {
      console.error('Failed to fetch ranking:', error);
      return {
        success: false,
        data: [],
        count: 0
      };
    }
  }
}

// Export a singleton instance
export const rankingService = new RankingService();

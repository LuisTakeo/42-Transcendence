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
  tournamentPoints?: number; // Added property to track tournament points
  pointsDiff?: number;
  pointsMade?: number;
}

const RESERVED_USER_IDS = [4, 5];

export class RankingService extends BaseApiService {
  // Get all users ranked by their performance
  async getRanking(): Promise<SimpleResponse<RankingUser>> {
    try {
      // Get all users
      const usersResponse = await usersService.getAllUsers();

      if (!usersResponse.success || !usersResponse.data) {
        throw new Error('Failed to fetch users');
      }

      const users = usersResponse.data.filter(user => !RESERVED_USER_IDS.includes(user.id));
      const userIds = users.map(user => user.id);

      // Get bulk stats for all users in a single request
      const bulkStatsResponse = await matchesService.getBulkUserStats(userIds);
      const statsMap = bulkStatsResponse.success ? bulkStatsResponse.data : {};

      // Build ranking users with stats
      const rankingUsers: RankingUser[] = users.map(user => {
        const stats = statsMap[user.id] || {
          totalMatches: 0,
          wins: 0,
          losses: 0,
          winRate: 0
        };
        const points = (stats.wins * 3);
        return {
          position: 0, // Will be set after sorting
          id: user.id,
          username: user.username,
          name: user.name,
          totalMatches: stats.totalMatches,
          wins: stats.wins,
          winRate: stats.winRate,
          points: points
        };
      });

      // Sort by points, then wins, then matches
      rankingUsers.sort((a, b) => {
        if ((b.tournamentPoints ?? 0) !== (a.tournamentPoints ?? 0)) {
          return (b.tournamentPoints ?? 0) - (a.tournamentPoints ?? 0);
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

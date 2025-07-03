import { BaseApiService } from './base-api.ts';
import { SimpleResponse, SingleResponse } from './types.ts';

export interface Friend {
  user1_id: number;
  user2_id: number;
  user1_name?: string;
  user1_username?: string;
  user2_name?: string;
  user2_username?: string;
  created_at?: string;
}

export interface CreateFriendData {
  user1_id: number;
  user2_id: number;
}

export interface FriendshipCheckResponse {
  user1_id: number;
  user2_id: number;
  are_friends: boolean;
}

export class FriendsService extends BaseApiService {
  // Get friends by user ID
  async getFriendsByUser(userId: number): Promise<SimpleResponse<Friend>> {
    return this.request<SimpleResponse<Friend>>(`/friends/user/${userId}`);
  }

  // Check if two users are friends
  async checkFriendship(userId1: number, userId2: number): Promise<SingleResponse<FriendshipCheckResponse>> {
    return this.request<SingleResponse<FriendshipCheckResponse>>(`/friends/check/${userId1}/${userId2}`);
  }

  // Create new friendship
  async createFriendship(friendData: CreateFriendData): Promise<SingleResponse<Friend>> {
    return this.request<SingleResponse<Friend>>('/friends', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(friendData),
    });
  }

  // Delete friendship
  async deleteFriendship(userId1: number, userId2: number): Promise<{ success: boolean; message?: string }> {
    return this.request<{ success: boolean; message?: string }>(`/friends/${userId1}/${userId2}`, {
      method: 'DELETE',
      // Don't set Content-Type for DELETE requests without body
      headers: {},
    });
  }

  // Get user's friend count
  async getUserFriendCount(userId: number): Promise<SingleResponse<{ user_id: number; friend_count: number }>> {
    return this.request<SingleResponse<{ user_id: number; friend_count: number }>>(`/friends/user/${userId}/count`);
  }
}

// Export a singleton instance
export const friendsService = new FriendsService();

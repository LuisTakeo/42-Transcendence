import { BaseApiService } from './base-api.ts';
import { PaginatedResponse, SimpleResponse, SingleResponse } from './types.ts';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar_url: string | null;
  is_online: number;
  last_seen_at: string | null;
  two_factor_enabled?: number;
  two_factor_secret?: string;
  google_id?: string;
  created_at: string;
}

export interface UserStats {
	twoFactorEnabled: boolean;
	friendsCount: number;
	totalWins: number;
	topRanked: boolean;
  }

const RESERVED_USER_IDS = [999998, 999999];

export class UsersService extends BaseApiService {
  // Get users with pagination and search
  async getUsers(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append('search', search);
    }


    const response = await this.request<PaginatedResponse<User>>(`/users?${params.toString()}`);
    if (response.success && response.data) {
      response.data = response.data.filter(user => !RESERVED_USER_IDS.includes(user.id));
    }
    return response;
  }

  // Get all users without pagination
  async getAllUsers(): Promise<SimpleResponse<User>> {
    const response = await this.request<SimpleResponse<User>>('/users');
    if (response.success && response.data) {
      response.data = response.data.filter(user => !RESERVED_USER_IDS.includes(user.id));
    }
    return response;
  }

  // Get user by ID
  async getUserById(id: number): Promise<SingleResponse<User>> {
    return this.request<SingleResponse<User>>(`/users/${id}`);
  }

  // Update user
  async updateUser(id: number, updateData: Partial<User>): Promise<SingleResponse<User>> {
    return this.request<SingleResponse<User>>(`/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
  }

  // Get available avatars
  async getAvailableAvatars(): Promise<SimpleResponse<string[]>> {
    return this.request<SimpleResponse<string[]>>('/users/avatars/list');
  }

  // Navigate to user profile
  navigateToProfile(userId: number): void {
    // Update the URL to include the user ID
    window.history.pushState({}, '', `/profile/${userId}`);

    // Dispatch a custom event to notify the router
    window.dispatchEvent(new CustomEvent('routeChange', {
      detail: { path: `/profile/${userId}` }
    }));
  }

  async getUserStats(userId: number): Promise<SingleResponse<UserStats>> {
    // Aqui você pode criar uma rota específica no backend que já retorna esses dados,
    // ou montar na mão consultando os serviços que você tem.

	return this.request<SingleResponse<UserStats>>(`/users/${userId}/stats`, {
		method: 'GET',
		headers: {
		  'Content-Type': 'application/json',
		},
	  });
  }
}

// Export a singleton instance
export const usersService = new UsersService();

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
  created_at: string;
}

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

    return this.request<PaginatedResponse<User>>(`/users?${params.toString()}`);
  }

  // Get all users without pagination
  async getAllUsers(): Promise<SimpleResponse<User>> {
    return this.request<SimpleResponse<User>>('/users/all');
  }

  // Get user by ID
  async getUserById(id: number): Promise<SingleResponse<User>> {
    return this.request<SingleResponse<User>>(`/users/${id}`);
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
}

// Export a singleton instance
export const usersService = new UsersService();

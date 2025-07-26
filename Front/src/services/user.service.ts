import { authService } from './auth.service.ts';
import API_BASE_URL from './base-api.ts';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar_url?: string;
  last_seen_at?: string;
  two_factor_enabled?: number;
  google_id?: string;
  created_at?: string;
  // Additional computed fields for compatibility
  rank?: number;
  wins?: number;
  losses?: number;
}

class UserService {
  private currentUser: User | null = null;
  private userCache: Map<number, User> = new Map();

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    if (!authService.isAuthenticated()) {
      return null;
    }

    try {
      // Clear cache to get fresh data
      this.currentUser = null;

      const url = `${API_BASE_URL}/users/me`;
      const authToken = authService.getAuthToken();

      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      };
      const response = await fetch(url, {
        headers
      });
	  console.log(API_BASE_URL)
	  console.log(url)

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, clear auth
          authService.removeAuthToken();
          return null;
        }
        const errorText = await response.text();
        console.error('Failed to fetch user:', response.status, errorText);
        throw new Error(`Failed to fetch user: ${response.status}`);
      }

      const text = await response.text();
	//  console.log('Current user response:', text);
      const user = JSON.parse(text);
      this.currentUser = user;
      this.userCache.set(user.id, user);
      return user;

    } catch (error) {
      console.error('Error fetching current user:', error);
      this.currentUser = null;
      return null;
    }
  }

  /**
   * Get user by ID (with caching)
   */
  async getUserById(userId: number): Promise<User | null> {
    // Check if the user is already in the cache
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId) || null;
    }

    try {
      const url = `${API_BASE_URL}/users/${userId}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authService.getAuthToken()}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user ${userId}: ${response.status}`);
      }

      const responseData = await response.json();

      // Extract user data from response if it's wrapped in a success/data structure
      const user = responseData.data || responseData;

      this.userCache.set(userId, user);
      return user;

    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Update current user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User | null> {
    if (!authService.isAuthenticated()) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authService.getAuthToken()}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.status}`);
      }

      const updatedUser = await response.json();
      this.currentUser = updatedUser;
      this.userCache.set(updatedUser.id, updatedUser);
      return updatedUser;

    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<string | null> {
    if (!authService.isAuthenticated()) {
      return null;
    }

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getAuthToken()}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to upload avatar: ${response.status}`);
      }

      const result = await response.json();

      // Update current user cache
      if (this.currentUser) {
        this.currentUser.avatar_url = result.avatarUrl;
        this.userCache.set(this.currentUser.id, this.currentUser);
      }

      return result.avatarUrl;

    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  }

  /**
   * Get user stats (wins, losses, rank)
   */
  async getUserStats(userId?: number): Promise<any> {
    const targetUserId = userId || this.currentUser?.id;

    if (!targetUserId || !authService.isAuthenticated()) {
      return null;
    }

    try {
      const url = `${API_BASE_URL}/matches/player/${targetUserId}/stats`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authService.getAuthToken()}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user stats: ${response.status}`);
      }

      const responseData = await response.json();

      // Extract stats data from response if it's wrapped in a success/data structure
      const stats = responseData.data || responseData;
      return stats;

    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
      return null;
    }
  }

  /**
   * Clear user cache (call on logout)
   */
  clearCache(): void {
    this.currentUser = null;
    this.userCache.clear();
  }

  /**
   * Clear cache for a specific user
   */
  clearUserCache(userId: number): void {
    this.userCache.delete(userId);
  }

  /**
   * Get cached current user (synchronous)
   */
  getCachedCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if current user is authenticated and redirect if not
   */
  async requireAuth(): Promise<User | null> {
    const user = await this.getCurrentUser();
    if (!user) {
      // Redirect to login
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new Event('popstate'));
      return null;
    }
    return user;
  }
}

export const userService = new UserService();

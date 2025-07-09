import { BaseApiService } from './base-api.ts';

export interface GoogleLoginResponse {
  success?: boolean;
  message: string;
  qrCode?: string;
  secret?: string;
  needTwoFactorSetup?: boolean;
  needTwoFactorCode?: boolean;
  token?: string;
}

export interface Google2FAResponse {
  success?: boolean;
  message: string;
  token?: string;
  error?: string;
}

export class AuthService extends BaseApiService {

  // Initial Google login - returns QR code for 2FA setup if needed
  async loginWithGoogle(idToken: string): Promise<GoogleLoginResponse> {
    try {
      return await this.request<GoogleLoginResponse>('/login-google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
    } catch (error: any) {
      // Handle 2FA required case specifically
      if (error.message && error.message.includes('Two-factor authentication code required')) {
        // Return a response indicating 2FA is needed
        return {
          success: false,
          message: 'Two-factor authentication code required',
          needTwoFactorSetup: false,
          needTwoFactorCode: true,
          token: undefined,
          qrCode: undefined
        };
      }
      // Re-throw other errors
      throw error;
    }
  }

  // Complete Google login with 2FA code
  async completeGoogleLogin(idToken: string, twoFactorCode: string): Promise<Google2FAResponse> {
    return this.request<Google2FAResponse>('/login-google/2fa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken,
        twoFactorCode
      }),
    });
  }

  // Store authentication token
  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Get stored authentication token
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Remove authentication token (logout)
  removeAuthToken(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUserId');
    // Clear user cache
    import('./user.service.ts').then(({ userService }) => {
      userService.clearCache();
    });
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  // Store current user ID temporarily (for development)
  setCurrentUserId(userId: number): void {
    localStorage.setItem('currentUserId', userId.toString());
  }

  // Get current user ID (for development)
  getCurrentUserId(): number | null {
    const userId = localStorage.getItem('currentUserId');
    return userId ? parseInt(userId, 10) : null;
  }
}

// Export a singleton instance
export const authService = new AuthService();

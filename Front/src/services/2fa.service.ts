// 2fa.service.ts
import { BaseApiService } from './base-api';
import { authService } from './auth.service';

interface TwoFactorResponse {
  success: boolean;
  message?: string;
  data?: {
    qrCode?: string;
    secret?: string;
  };
}

interface VerifyCodeResponse {
  success: boolean;
  valid?: boolean;
  message?: string;
}

interface SimpleResponse {
  success: boolean;
  message?: string;
}

class TwoFactorService extends BaseApiService {
  // Helper method to add authentication headers
  private getAuthHeaders(): Record<string, string> {
    const token = authService.getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Generate QR code for 2FA setup
  async generateQRCode(): Promise<TwoFactorResponse> {
    return this.request<TwoFactorResponse>('/users/2fa/generate-qr', {
      headers: this.getAuthHeaders(),
    });
  }

  // Enable 2FA with verification code
  async enable2FA(code: string): Promise<SimpleResponse> {
    return this.request<SimpleResponse>('/users/2fa/enable', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ code }),
    });
  }

  // Disable 2FA
  async disable2FA(): Promise<SimpleResponse> {
    return this.request<SimpleResponse>('/users/2fa/disable', {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
  }

  // Verify a 2FA code (for testing)
  async verifyCode(code: string): Promise<VerifyCodeResponse> {
    return this.request<VerifyCodeResponse>('/users/2fa/verify', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ code }),
    });
  }
}

// Export a singleton instance
export const twoFactorService = new TwoFactorService();

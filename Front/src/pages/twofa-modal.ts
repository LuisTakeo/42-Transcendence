import { authService } from '../services/auth.service.ts';
import { showSuccessMessage, showErrorMessage } from './notification.ts';

export function show2FAModal(qrCode: string | null, idToken: string, isCodeInput: boolean = false): void {
  // Create modal HTML
  const modalHTML = `
    <div id="twofa-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-[#1E1B4B] rounded-lg p-8 max-w-md w-full mx-4">
        <h2 class="text-2xl font-bold text-white mb-4 text-center">
          ${isCodeInput ? 'Two-Factor Authentication' : 'Setup Two-Factor Authentication'}
        </h2>

        ${!isCodeInput && qrCode ? `
        <div class="text-center mb-6">
          <p class="text-white mb-4">Scan this QR code with your authenticator app:</p>
          <div class="flex justify-center mb-4">
            <img src="${qrCode}" alt="QR Code" class="border border-gray-300 rounded">
          </div>
          <p class="text-sm text-gray-300">
            Use apps like Google Authenticator, Authy, or Microsoft Authenticator
          </p>
        </div>
        ` : ''}

        ${isCodeInput ? `
        <div class="text-center mb-6">
          <p class="text-white mb-4">Enter the 6-digit code from your authenticator app:</p>
        </div>
        ` : ''}

        <div class="mb-6">
          <label for="twofa-code" class="block text-white text-sm font-medium mb-2">
            ${isCodeInput ? 'Authentication Code:' : 'Enter the 6-digit code from your authenticator app:'}
          </label>
          <input
            type="text"
            id="twofa-code"
            maxlength="6"
            pattern="[0-9]{6}"
            class="w-full px-4 py-2 rounded-md bg-[#383568] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="123456"
            autocomplete="off"
          >
        </div>

        <div class="flex space-x-4">
          <button
            id="cancel-twofa"
            class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            id="verify-twofa"
            class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            ${isCodeInput ? 'Verify & Login' : 'Complete Setup'}
          </button>
        </div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Get modal elements
  const modal = document.getElementById('twofa-modal')!;
  const codeInput = document.getElementById('twofa-code') as HTMLInputElement;
  const verifyBtn = document.getElementById('verify-twofa')!;
  const cancelBtn = document.getElementById('cancel-twofa')!;

  // Focus on input
  setTimeout(() => codeInput.focus(), 100);

  // Handle verify button
  verifyBtn.addEventListener('click', async () => {
    const code = codeInput.value.trim();

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      showErrorMessage('Please enter a valid 6-digit code');
      return;
    }

    try {
      // Show loading state
      verifyBtn.textContent = 'Verifying...';
      verifyBtn.setAttribute('disabled', 'true');

      // Complete Google login with 2FA
      const response = await authService.completeGoogleLogin(idToken, code);

      if (response.token) {
        // Store auth token
        authService.setAuthToken(response.token);

        // Close modal
        modal.remove();

        // Show success message
        showSuccessMessage('Login successful! Redirecting...');

        // Redirect to home page
        setTimeout(() => {
          window.history.pushState({}, '', '/home');
          window.dispatchEvent(new Event('popstate'));
        }, 1000);

      } else {
        throw new Error(response.error || 'Login failed');
      }

    } catch (error) {
      console.error('2FA verification error:', error);
      showErrorMessage('Invalid code. Please try again.');

      // Reset button state
      verifyBtn.textContent = 'Verify & Login';
      verifyBtn.removeAttribute('disabled');

      // Clear input
      codeInput.value = '';
      codeInput.focus();
    }
  });

  // Handle cancel button
  cancelBtn.addEventListener('click', () => {
    modal.remove();
  });

  // Handle Enter key in input
  codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      verifyBtn.click();
    }
  });

  // Handle Escape key
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', escapeHandler);
    }
  });

  // Auto-format input (add spaces for readability)
  codeInput.addEventListener('input', (e) => {
    const input = e.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits

    // Limit to 6 digits
    if (value.length > 6) {
      value = value.slice(0, 6);
    }

    input.value = value;
  });
}

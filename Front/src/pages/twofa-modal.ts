import { authService } from '../services/auth.service.ts';
import { twoFactorService } from '../services/2fa.service.ts';
import { showSuccessMessage, showErrorMessage } from './notification.ts';
import { userService } from '../services/user.service.ts';

export function show2FAModal(qrCode: string, secret: string, isLoginMode: boolean = false, isSetupMode: boolean = false) {
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Get modal elements
  const modal = document.getElementById('twofa-modal')!;
  const qrCodeImg = document.getElementById('qr-code-img') as HTMLImageElement;
  const secretText = document.getElementById('secret-text') as HTMLDivElement;
  const codeInput = document.getElementById('twofa-code') as HTMLInputElement;
  const verifyBtn = document.getElementById('verify-twofa')!;
  const cancelBtn = document.getElementById('cancel-twofa')!;
  const modalTitle = document.getElementById('2fa-modal-title') as HTMLHeadingElement;
  const modalDescription = document.getElementById('2fa-modal-description') as HTMLParagraphElement;

  // Set QR code image
  qrCodeImg.src = qrCode;

  // Set modal content based on mode
  if (isLoginMode) {
    modalTitle.textContent = 'Two-Factor Authentication';
    modalDescription.textContent = 'Enter the 6-digit code from your authenticator app:';
    verifyBtn.textContent = 'Verify & Login';

    // Hide QR code and setup instructions for login mode
    const qrCodeContainer = document.querySelector('.bg-white.p-4.rounded-lg.mb-6') as HTMLElement;
    const setupInstructions = document.getElementById('setup-instructions');
    if (qrCodeContainer) qrCodeContainer.style.display = 'none';
    if (setupInstructions) setupInstructions.style.display = 'none';
  } else if (isSetupMode) {
    modalTitle.textContent = 'Setup Two-Factor Authentication';
    modalDescription.textContent = 'Scan this QR code with your authenticator app:';
    verifyBtn.textContent = 'Complete Setup';
  } else {
    modalTitle.textContent = 'Two-Factor Authentication';
    modalDescription.textContent = 'Enter the 6-digit code from your authenticator app:';
    verifyBtn.textContent = 'Verify';
  }

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

      if (isSetupMode) {
        // Handle 2FA setup from Settings page
        const response = await twoFactorService.enable2FA(code);

        if (response.success) {
          // Close modal
          modal.remove();

          // Show success message
          showSuccessMessage('Two-factor authentication enabled successfully!');

          // Refresh the page to update the UI
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          throw new Error(response.message || 'Failed to enable 2FA');
        }
      } else {
        // Handle login verification
        const response = await authService.completeGoogleLogin(secret, code); // secret contains the idToken in login mode

        if (response.token) {
          // Close modal
          modal.remove();

          // Set auth token and redirect
          authService.setAuthToken(response.token);
          showSuccessMessage('Login successful! Redirecting...');

          setTimeout(() => {
            window.history.pushState({}, '', '/home');
            window.dispatchEvent(new Event('popstate'));
          }, 1000);
        } else {
          throw new Error(response.message || 'Login failed');
        }
      }

    } catch (error) {
      console.error('2FA verification error:', error);
      showErrorMessage('Invalid code. Please try again.');

      // Reset button state
      verifyBtn.textContent = isSetupMode ? 'Complete Setup' : 'Verify & Login';
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

const modalHTML = `
<div id="twofa-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-[#1E1B4B] rounded-lg p-8 max-w-md w-full mx-4">
    <div class="text-center">
      <h2 id="2fa-modal-title" class="text-2xl font-bold text-white mb-4">Setup Two-Factor Authentication</h2>
      <p id="2fa-modal-description" class="text-gray-300 mb-6">Scan this QR code with your authenticator app:</p>



      <div class="bg-white p-4 rounded-lg mb-6 inline-block">
        <img id="qr-code-img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="QR Code" class="w-48 h-48" />
      </div>

      <div id="secret-text" class="text-xs text-gray-400 mb-4 hidden">Secret: <span class="font-mono"></span></div>

      <div class="mb-4">
        <label for="twofa-code" class="block text-sm font-medium text-gray-300 mb-2">Enter the 6-digit code from your authenticator app:</label>
        <input
          type="text"
          id="twofa-code"
          class="w-full px-3 py-2 rounded-md bg-[#383568] text-white border border-gray-600 focus:outline-none focus:border-purple-500"
          placeholder="123456"
          maxlength="6"
          pattern="[0-9]{6}"
        />
      </div>

      <div class="flex gap-3">
        <button
          id="verify-twofa"
          class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition"
        >
          Complete Setup
        </button>
        <button
          id="cancel-twofa"
          class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>
`;

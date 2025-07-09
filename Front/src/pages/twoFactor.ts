import { showSuccessMessage, showErrorMessage } from './notification.ts';
import { userService } from '../services/user.service.ts';
import { twoFactorService } from '../services/2fa.service.ts';

export function initializeTwoFactor() {
  const activateBtn = document.getElementById('activate-2fa-btn') as HTMLButtonElement;
  const confirmBtn = document.getElementById('confirm-2fa-btn') as HTMLButtonElement;
  const inputSection = document.getElementById('2fa-input-section') as HTMLDivElement;
  const status = document.getElementById('2fa-status') as HTMLDivElement;
  const codeInput = document.getElementById('2fa-code') as HTMLInputElement;

  if (!activateBtn || !confirmBtn || !inputSection || !status || !codeInput) {
    console.warn('Two-factor authentication elements not found');
    return;
  }

  activateBtn.addEventListener('click', async () => {
    const buttonText = activateBtn.textContent?.trim();

    if (buttonText === 'Enable two-factor authentication') {
      // User wants to enable 2FA - show input section
      activateBtn.classList.add('hidden');
      inputSection.classList.remove('hidden');
    } else if (buttonText === 'Disable two-factor authentication') {
      // User wants to disable 2FA - confirm and disable
      if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
        try {
          await disable2FA();
        } catch (error) {
          console.error('Error disabling 2FA:', error);
          showErrorMessage('Failed to disable two-factor authentication. Please try again.');
        }
      }
    }
  });

  confirmBtn.addEventListener('click', async () => {
    const code = codeInput.value.trim();

    if (!code || code.length !== 6) {
      showErrorMessage('Please enter a valid 6-digit code.');
      return;
    }

    try {
      await enable2FA(code);
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      showErrorMessage('Failed to enable two-factor authentication. Please try again.');
    }
  });
}

async function enable2FA(code: string): Promise<void> {
  try {
    const response = await twoFactorService.enable2FA(code);

    if (response.success) {
      const inputSection = document.getElementById('2fa-input-section') as HTMLDivElement;
      const status = document.getElementById('2fa-status') as HTMLDivElement;
      const activateBtn = document.getElementById('activate-2fa-btn') as HTMLButtonElement;

      inputSection.classList.add('hidden');
      status.textContent = 'Two-factor authentication is enabled.';
      status.className = 'mb-4 text-lg text-green-400';
      activateBtn.textContent = 'Disable two-factor authentication';
      activateBtn.className = 'bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-md text-white font-medium shadow-sm hover:shadow-lg';
      activateBtn.classList.remove('hidden');

      // Clear the input
      const codeInput = document.getElementById('2fa-code') as HTMLInputElement;
      if (codeInput) codeInput.value = '';

      showSuccessMessage('Two-factor authentication enabled!');

      // Clear user cache to refresh user data
      userService.clearCache();
    } else {
      throw new Error(response.message || 'Failed to enable 2FA');
    }
  } catch (error) {
    console.error('2FA enable error:', error);
    showErrorMessage(error instanceof Error ? error.message : 'Failed to enable two-factor authentication.');
  }
}

async function disable2FA(): Promise<void> {
  try {
    const response = await twoFactorService.disable2FA();

    if (response.success) {
      const status = document.getElementById('2fa-status') as HTMLDivElement;
      const activateBtn = document.getElementById('activate-2fa-btn') as HTMLButtonElement;

      status.textContent = 'Two-factor authentication is not enabled.';
      status.className = 'mb-4 text-lg text-gray-300';
      activateBtn.textContent = 'Enable two-factor authentication';
      activateBtn.className = 'bg-[#383568] hover:bg-[#4a4480] transition px-4 py-2 rounded-md text-white font-medium shadow-sm hover:shadow-lg';

      showSuccessMessage('Two-factor authentication disabled.');

      // Clear user cache to refresh user data
      userService.clearCache();
    } else {
      throw new Error(response.message || 'Failed to disable 2FA');
    }
  } catch (error) {
    console.error('2FA disable error:', error);
    showErrorMessage(error instanceof Error ? error.message : 'Failed to disable two-factor authentication.');
  }
}

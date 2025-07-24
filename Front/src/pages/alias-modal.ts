import { userService } from '../services/user.service.ts';
import { showErrorMessage } from './notification.ts';

export async function showAliasModal(): Promise<{ player1: string, player2: string } | null> {
  // Get current user (not used for pre-filling now)
  await userService.getCurrentUser();

  // Modal HTML
  const modalHTML = `
  <div id="alias-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-[#1E1B4B] rounded-lg p-8 max-w-md w-full mx-4">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-white mb-4">Enter Player Aliases</h2>
        <div class="mb-6">
          <label for="player1-alias-input" class="block text-sm font-medium text-gray-300 mb-2">Player 1 (You)</label>
          <input
            type="text"
            id="player1-alias-input"
            class="w-full px-3 py-2 rounded-md bg-[#383568] text-white border border-gray-600 focus:outline-none focus:border-purple-500 mb-4"
            placeholder="Enter alias for Player 1"
            maxlength="20"
          />
          <label for="player2-alias-input" class="block text-sm font-medium text-gray-300 mb-2">Player 2 Alias</label>
          <input
            type="text"
            id="player2-alias-input"
            class="w-full px-3 py-2 rounded-md bg-[#383568] text-white border border-gray-600 focus:outline-none focus:border-purple-500"
            placeholder="Enter alias for Player 2"
            maxlength="20"
          />
        </div>
        <div class="flex gap-3">
          <button id="start-game-btn" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition">Start Game</button>
          <button id="cancel-alias-btn" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition">Cancel</button>
        </div>
      </div>
    </div>
  </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Get modal elements
  const modal = document.getElementById('alias-modal')!;
  const player1Input = document.getElementById('player1-alias-input') as HTMLInputElement;
  const player2Input = document.getElementById('player2-alias-input') as HTMLInputElement;
  const startBtn = document.getElementById('start-game-btn')!;
  const cancelBtn = document.getElementById('cancel-alias-btn')!;

  // Focus on Player 1 input
  setTimeout(() => player1Input.focus(), 100);

  // Return a promise that resolves on submit/cancel
  return new Promise((resolve) => {
    function validateAndSubmit() {
      const player1AliasValue = player1Input.value.trim() || 'Player 1';
      const player2AliasValue = player2Input.value.trim() || 'Player 2';
      if (player1AliasValue.toLowerCase() === player2AliasValue.toLowerCase()) {
        showErrorMessage('Player 1 and Player 2 cannot have the same alias.');
        return;
      }
      modal.remove();
      window.removeEventListener('popstate', popHandler);
      resolve({ player1: player1AliasValue, player2: player2AliasValue });
    }
    function cleanupAndResolveNull() {
      modal.remove();
      window.removeEventListener('popstate', popHandler);
      resolve(null);
    }
    function popHandler() {
      cleanupAndResolveNull();
    }
    startBtn.addEventListener('click', validateAndSubmit);
    cancelBtn.addEventListener('click', () => {
      modal.remove();
      window.removeEventListener('popstate', popHandler);
      resolve(null);
      window.history.pushState({}, '', '/home');
      window.dispatchEvent(new Event('popstate'));
    });
    player1Input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') validateAndSubmit();
    });
    player2Input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') validateAndSubmit();
    });
    document.addEventListener('keydown', function escapeHandler(e) {
      if (e.key === 'Escape') {
        cleanupAndResolveNull();
        document.removeEventListener('keydown', escapeHandler);
      }
    });
    window.addEventListener('popstate', popHandler);
  });
}

export async function showRemoteAliasModal(): Promise<string | null> {
  // Clean up any existing modals first
  const existingModal = document.getElementById('remote-alias-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Save current URL to handle navigation properly
  const previousUrl = window.location.pathname;

  // Modal HTML for single alias input
  const modalHTML = `
  <div id="remote-alias-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-[#1E1B4B] rounded-lg p-8 max-w-md w-full mx-4">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-white mb-4">Enter your alias</h2>
        <input
          type="text"
          id="remote-alias-input"
          class="w-full px-3 py-2 rounded-md bg-[#383568] text-white border border-gray-600 focus:outline-none focus:border-purple-500 mb-4"
          placeholder="Your alias"
          maxlength="20"
        />
      <div id="remote-alias-error" class="text-red-400 text-sm mb-2" style="display:none;"></div>
        <div class="flex gap-3 mt-4">
          <button id="remote-alias-ok" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition">OK</button>
          <button id="remote-alias-cancel" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition">Cancel</button>
        </div>
      </div>
    </div>
  </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modal = document.getElementById('remote-alias-modal')!;
  const input = document.getElementById('remote-alias-input') as HTMLInputElement;
  const okBtn = document.getElementById('remote-alias-ok')!;
  const cancelBtn = document.getElementById('remote-alias-cancel')!;
  const errorDiv = document.getElementById('remote-alias-error')!;

  setTimeout(() => input.focus(), 100);

  function showError(msg: string) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
  }

  function clearError() {
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
  }

  return new Promise((resolve) => {
    let isCleanedUp = false;

    function cleanup() {
      if (isCleanedUp) return;
      isCleanedUp = true;

      // Remove all event listeners first
      window.removeEventListener('popstate', popHandler);
      document.removeEventListener('keydown', escapeHandler);
      // Then remove the modal
      if (modal && modal.parentElement) {
        modal.remove();
      }
    }

    function cleanupAndNavigateHome() {
      if (isCleanedUp) return;
      cleanup();
      resolve(null);
      // Use replaceState to prevent history stack issues
      window.history.replaceState(null, '', '/home');
      window.dispatchEvent(new CustomEvent('urlChanged', { detail: '/home' }));
    }

    function cleanupAndResolve(value: string | null) {
      if (isCleanedUp) return;
      cleanup();
      resolve(value);
    }

    function popHandler(event: PopStateEvent) {
      // When browser back button is used
      cleanup();
      resolve(null);
    }

    function escapeHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        cleanupAndNavigateHome();
      }
    }

    function validateAndSubmit() {
      const value = input.value.trim();
      if (!value) {
        showError('Alias cannot be empty.');
        input.focus();
        return;
      }
      clearError();
      cleanupAndResolve(value);
    }

    okBtn.addEventListener('click', validateAndSubmit);

    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      cleanupAndNavigateHome();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        validateAndSubmit();
      } else {
        clearError();
      }
    });

    // Add event listeners for cleanup
    document.addEventListener('keydown', escapeHandler);
    window.addEventListener('popstate', popHandler);
  });
}

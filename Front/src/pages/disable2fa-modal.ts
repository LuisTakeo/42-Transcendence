// Custom modal for disabling 2FA
export function showCustom2FADisableConfirm(callback: (confirmed: boolean) => void) {
  const modal = document.createElement('div');
  modal.id = 'disable-2fa-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
  modal.innerHTML = `
    <div class="bg-[#1E1B4B] rounded-lg p-8 max-w-md w-full mx-4 shadow-lg flex flex-col items-center">
      <h2 class="text-2xl font-bold text-white mb-4">Disable Two-Factor Authentication</h2>
      <p class="text-white mb-6 text-center">Are you sure you want to disable two-factor authentication? This will make your account less secure.</p>
      <div class="flex gap-4 w-full justify-center">
        <button id="disable-2fa-confirm" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold">Disable</button>
        <button id="disable-2fa-cancel" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-semibold">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  setTimeout(() => {
    const confirmBtn = document.getElementById('disable-2fa-confirm');
    if (confirmBtn) confirmBtn.focus();
  }, 0);

  modal.querySelector('#disable-2fa-confirm')?.addEventListener('click', () => {
    document.body.removeChild(modal);
    callback(true);
  });
  modal.querySelector('#disable-2fa-cancel')?.addEventListener('click', () => {
    document.body.removeChild(modal);
    callback(false);
  });
  function escListener(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      document.body.removeChild(modal);
      callback(false);
      document.removeEventListener('keydown', escListener);
    }
  }
  document.addEventListener('keydown', escListener);
}

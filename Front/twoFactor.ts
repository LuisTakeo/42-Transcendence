document.addEventListener('DOMContentLoaded', () => {
  const activateBtn = document.getElementById('activate-2fa-btn') as HTMLButtonElement;
  const confirmBtn = document.getElementById('confirm-2fa-btn') as HTMLButtonElement;
  const inputSection = document.getElementById('2fa-input-section') as HTMLDivElement;
  const status = document.getElementById('2fa-status') as HTMLDivElement;
  const codeInput = document.getElementById('2fa-code') as HTMLInputElement;

  activateBtn.addEventListener('click', () => {
    activateBtn.classList.add('hidden');
    inputSection.classList.remove('hidden');
  });

  confirmBtn.addEventListener('click', () => {
    const code = codeInput.value.trim();

    // Simulated code validation
    if (code === '123456') {
      inputSection.classList.add('hidden');
      status.textContent = '✅ Two-factor authentication is enabled.';
      status.classList.remove('text-gray-300');
      status.classList.add('text-green-400');
    } else {
      alert('Invalid code. Please try again.');
    }
  });
});

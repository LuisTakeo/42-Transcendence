export function showWinnerModal(winner: string, onPlayAgain: () => void, onHome: () => void) {
  // Clean up any existing modals first
  const existingModal = document.getElementById('winner-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modalHTML = `
  <div id="winner-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50">
    <div class="bg-[#1E1B4B] rounded-lg p-8 max-w-md w-full mx-4">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-white mb-4">${winner} is the winner!</h2>
        <div class="flex gap-3 mt-6">
          <button id="play-again-btn" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition">Play Again</button>
          <button id="go-home-btn" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition">Go to Homepage</button>
        </div>
      </div>
    </div>
  </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modal = document.getElementById('winner-modal')!;
  const playAgainBtn = document.getElementById('play-again-btn')!;
  const goHomeBtn = document.getElementById('go-home-btn')!;

  let isCleanedUp = false;

  // Remove modal and cleanup listeners
  function removeModalAndCleanup() {
    if (isCleanedUp) return;
    isCleanedUp = true;

    window.removeEventListener('popstate', popHandler);
    document.removeEventListener('keydown', escapeHandler);
    if (modal && modal.parentElement) {
      modal.remove();
    }
  }

  function popHandler() {
    removeModalAndCleanup();
  }

  function escapeHandler(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      removeModalAndCleanup();
      onHome();
    }
  }

  window.addEventListener('popstate', popHandler);
  document.addEventListener('keydown', escapeHandler);

  playAgainBtn.addEventListener('click', () => {
    removeModalAndCleanup();
    onPlayAgain();
  });

  goHomeBtn.addEventListener('click', () => {
    removeModalAndCleanup();
    onHome();
  });
}

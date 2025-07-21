import { GameType, MainGame } from "../pong-game/game";

interface GamePageOptions {
    gameType: GameType;
    playerAliases: { player1: string; player2: string };
    playerIds?: { player1?: number; player2?: number };
    tournamentId?: number;
}

function getDisplayName(userId: number, alias: string): string {
  if (userId === 999999) return 'AI Opponent';
  if (userId === 999998) return 'Local Player 2';
  return alias;
}
import { showAliasModal } from "./alias-modal";

export function showWinnerModal(winner: string, onPlayAgain: () => void, onHome: () => void) {
  const modalHTML = `
  <div id="winner-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-[#1E1B4B] rounded-lg p-8 max-w-md w-full mx-4">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-white mb-4">${winner} venceu!</h2>
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
  playAgainBtn.addEventListener('click', () => {
    modal.remove();
    onPlayAgain();
  });
  goHomeBtn.addEventListener('click', () => {
    modal.remove();
    onHome();
  });
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', escapeHandler);
    }
  });
}

export default async function gamePage(gameType: GameType): Promise<void> {
    const app = document.getElementById('app');
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.style.display = 'none';
    if (app) app.style.marginLeft = '0';
    if (!app) {
        return;
    }
    // Add centering class for game page
    app.classList.add('game-active');
    app.innerHTML = '';

    // Create a flex column container
    const container = document.createElement('div');
    container.className = 'game-flex-col';

    // Create and insert score bar above the canvas
    const scoreBar = document.createElement('div');
    scoreBar.id = 'score-bar';
    // Initial placeholder, will be updated by game logic
    scoreBar.innerHTML = `<span class="score-left"></span><span class="score-center">0 - 0</span><span class="score-right"></span>`;
    container.appendChild(scoreBar);


    const canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    app.innerHTML = '';
    app.appendChild(canvas);
    const game = new MainGame('gameCanvas', gameType);
    game.run();
}

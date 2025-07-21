import { GameType, MainGame } from "../pong-game/game";
import { showAliasModal } from "./alias-modal";
interface GamePageOptions {
    gameType: GameType;
    playerAliases: { player1: string; player2: string };
    playerIds?: { player1?: number; player2?: number };
    tournamentId?: number;
}

function getDisplayName(userId: number, alias: string): string {
  if (userId === 4) return 'AI Opponent';
  if (userId === 5) return 'Local Player 2';
  return alias;
}

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
        return ;
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
    container.appendChild(canvas);

    // Create and insert instruction bar below the canvas
    const instructionBar = document.createElement('div');
    instructionBar.id = 'instruction-bar';
    // Set initial instruction text based on game type
    if (gameType === GameType.LOCAL_TWO_PLAYERS) {
      instructionBar.innerHTML = 'Use W/S for Player 1 | Arrows for Player 2';
    } else {
      instructionBar.innerHTML = '<i class="fa-solid fa-up-down" style="margin-right:8px; color: #fff;"></i>Use arrows to move!';
    }
    container.appendChild(instructionBar);

    app.appendChild(container);

    // Helper to update the score bar
    function updateScoreBar(leftLabel: string, scoreText: string, rightLabel: string) {
        const left = scoreBar.querySelector('.score-left') as HTMLElement;
        const center = scoreBar.querySelector('.score-center') as HTMLElement;
        const right = scoreBar.querySelector('.score-right') as HTMLElement;
        if (left) left.textContent = leftLabel;
        if (center) center.textContent = scoreText;
        if (right) right.textContent = rightLabel;
    }

    if (gameType === GameType.LOCAL_TWO_PLAYERS) {
        const aliases = await showAliasModal();
        if (!aliases) {
            // User cancelled, go back to home
            app.classList.remove('game-active');
            window.history.pushState({}, '', '/home');
            window.dispatchEvent(new Event('popstate'));
            return;
        }
        // Set initial labels
        updateScoreBar(aliases.player1, '0 - 0', aliases.player2);
        // Update instruction bar with aliases
        instructionBar.innerHTML = `Use W/S for ${aliases.player1} | Arrows for ${aliases.player2}`;
        // Fetch current user and pass player IDs
        const { userService } = await import('../services/user.service.ts');
        const currentUser = await userService.getCurrentUser();
        const game = new MainGame(
            'gameCanvas',
            gameType,
            100,
            80,
            10,
            { player1: aliases.player1, player2: aliases.player2 },
            { player1: currentUser?.id, player2: 999998 }
        );
        game.run();
    } else if (gameType === GameType.LOCAL_VS_AI) {
        // Set initial labels for CPU
        updateScoreBar('You', '0 - 0', 'CPU');
        // Fetch current user and pass player IDs
        const { userService } = await import('../services/user.service.ts');
        const currentUser = await userService.getCurrentUser();
        const game = new MainGame(
            'gameCanvas',
            gameType,
            100,
            80,
            10,
            { player1: 'You', player2: 'CPU' },
            { player1: currentUser?.id, player2: 999999 }
        );
        game.run();
    } else if (gameType === GameType.REMOTE) {
        // Set initial labels for remote
        updateScoreBar('Player 1', '0 - 0', 'Player 2');
        // Use new MainGame constructor signature
        const game = new MainGame(
            'gameCanvas',
            gameType,
            100,
            80,
            10,
            { player1: 'Player 1', player2: 'Player 2' }
        );
        game.run();
    }

    // Optionally, restore sidebar when leaving the game page
    window.addEventListener('popstate', () => {
        if (sidebar) sidebar.style.display = '';
        if (app) app.style.marginLeft = '80px';
    }, { once: true });
}

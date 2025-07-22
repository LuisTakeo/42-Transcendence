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

  // Remove modal and cleanup popstate listener
  function removeModalAndCleanup() {
    modal.remove();
    window.removeEventListener('popstate', popHandler);
    document.removeEventListener('keydown', escapeHandler);
  }
  function popHandler() {
    removeModalAndCleanup();
  }
  function escapeHandler(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      removeModalAndCleanup();
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

export default async function gamePage(options: GamePageOptions): Promise<void> {
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

    // Remove instruction bar creation and appending

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

    // New: function to be passed to MainGame for score updates
    function handleScoreUpdate(player1: string, score1: number, player2: string, score2: number) {
        updateScoreBar(player1, `${score1} - ${score2}`, player2);
    }

    if (options.gameType === GameType.LOCAL_TWO_PLAYERS) {
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
        // Fetch current user and pass player IDs
        const { userService } = await import('../services/user.service.ts');
        const currentUser = await userService.getCurrentUser();
        const game = new MainGame(
            'gameCanvas',
            options.gameType,
            100,
            80,
            2,
            { player1: aliases.player1, player2: aliases.player2 },
            { player1: currentUser?.id, player2: 5 },
            options.tournamentId,
            handleScoreUpdate // Pass callback
        );
        game.run();
    } else if (options.gameType === GameType.LOCAL_VS_AI) {
        // Set initial labels for CPU
        updateScoreBar('You', '0 - 0', 'CPU');
        // Fetch current user and pass player IDs
        const { userService } = await import('../services/user.service.ts');
        const currentUser = await userService.getCurrentUser();
        const game = new MainGame(
            'gameCanvas',
            options.gameType,
            100,
            80,
            2,
            { player1: 'You', player2: 'CPU' },
            { player1: currentUser?.id, player2: 4 },
            options.tournamentId,
            handleScoreUpdate // Pass callback
        );
        game.run();
    } else if (options.gameType === GameType.REMOTE) {
        // Show a modal to enter only the local user's alias
        const { showRemoteAliasModal } = await import('./alias-modal');
        const alias = await showRemoteAliasModal();
        if (!alias) {
            app.classList.remove('game-active');
            window.history.pushState({}, '', '/home');
            window.dispatchEvent(new Event('popstate'));
            return;
        }

        // Don't set initial score bar yet - wait for room assignment
        const game = new MainGame(
            'gameCanvas',
            options.gameType,
            100,
            80,
            2,
            { player1: 'Player 1', player2: 'Player 2' }, // Use neutral initial values
            undefined,
            options.tournamentId,
            handleScoreUpdate
        );
        game.run();

        // Real-time alias sync: send alias and listen for room_state
        setTimeout(() => {
            const remoteController = (game as any)._remoteController;
            if (!remoteController) return;
            const gameService = remoteController.getGameService && remoteController.getGameService();
            if (!gameService) return;

            // Send your alias to server
            gameService.sendMessage && gameService.sendMessage('set_alias', { alias });

            // Listen for initial room creation/joining
            gameService.onMessage && gameService.onMessage('room_created', (data: any) => {
                // First player is always left
                updateScoreBar(alias, '0 - 0', 'Waiting...');
            });

            gameService.onMessage && gameService.onMessage('room_joined', (data: any) => {
                // Second player is always right
                updateScoreBar('Player 1', '0 - 0', alias);
            });

            // Listen for room state updates
            gameService.onMessage && gameService.onMessage('room_state', (data: any) => {

                // Get player info from server state
                const player1Id = data.left?.userId ? Number(data.left.userId) : 0;
                const player2Id = data.right?.userId ? Number(data.right.userId) : 0;
                const player1Alias = data.left?.alias || 'Player 1';
                const player2Alias = data.right?.alias || 'Player 2';

                game.setPlayerInfo(player1Id, player1Alias, player2Id, player2Alias);
                updateScoreBar(player1Alias, '0 - 0', player2Alias);
            });
        }, 500);
    }

    // Optionally, restore sidebar when leaving the game page
    window.addEventListener('popstate', () => {
        if (sidebar) sidebar.style.display = '';
        if (app) app.style.marginLeft = '80px';
    }, { once: true });
}

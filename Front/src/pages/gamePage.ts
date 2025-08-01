import { GameType, MainGame } from "../pong-game/game";
import { showAliasModal } from "./alias-modal";
import { showErrorModal } from "./tournamentEvents";
import { userService } from "../services/user.service.ts";

interface GamePageOptions {
    gameType: GameType;
    playerAliases: { player1: string; player2: string } | null;
    playerIds?: { player1?: number; player2?: number };
    tournamentId?: number;
}

function getDisplayName(userId: number, alias: string): string {
  if (userId === 4) return 'AI Opponent';
  if (userId === 5) return 'Local Player 2';
  return alias;
}

export default async function gamePage(options: GamePageOptions): Promise<void> {
    // Route protection: require authentication
    const currentUser = await userService.requireAuth();
    if (!currentUser) {
        window.location.href = '/login';
        return;
    }

    const app = document.getElementById('app');
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.style.display = 'none';
    if (app) app.style.marginLeft = '0';
    if (!app) {
        return ;
    }
    // Add centering class for game page
    app.classList.add('game-active');
    app.innerHTML = `
      <!-- MODAL - ERRORS -->
      <div id="errors-modal" class="hidden fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
        <div id="errors-box" class="bg-[#1E1B4B] p-6 rounded space-y-4 text-center w-80 text-white">
          <p id="errors-message" class="text-xl"></p>
        </div>
      </div>
    `;

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
        const urlParams = new URLSearchParams(window.location.search);
        const sessionParam = urlParams.get('session');

        if (sessionParam) {
            // Verify navigation token
            const navigationToken = localStorage.getItem('tournament_navigation');
            if (!navigationToken) {
                // No token found - direct URL access attempted
                showErrorModal("You can't start this match!");
                setTimeout(() => {
                    window.location.href = '/tournament';
                }, 2000);
                return;
            }

            const { timestamp, session } = JSON.parse(navigationToken);

            // Check if token is expired (30 seconds validity)
            if (Date.now() - timestamp > 30000 || session !== sessionParam) {
                showErrorModal("This game session has expired");
                setTimeout(() => {
                    window.location.href = '/tournament';
                }, 2000);
                return;
            }

            // Clear the navigation token
            localStorage.removeItem('tournament_navigation');

            // Parse session parameter (format: player1-player2-tournamentId)
            const [player1, player2, tournamentId] = sessionParam.split('-');
            options.playerAliases = { player1, player2 };
            options.playerIds = { player1: 5, player2: 5 };
            options.tournamentId = parseInt(tournamentId);
        } else {
            // If no session parameter, show modal
            options.playerAliases = await showAliasModal();
            if (!options.playerAliases) {
                // User cancelled, go back to home
                app.classList.remove('game-active');
                window.history.pushState({}, '', '/home');
                window.dispatchEvent(new Event('popstate'));
                return;
            }

            options.playerIds = {
                player1: currentUser?.id || 5,
                player2: 5
            };
        }

        // Set initial labels
        updateScoreBar(options.playerAliases.player1, '0 - 0', options.playerAliases.player2);
        const game = new MainGame(
            'gameCanvas',
            options.gameType,
            100,
            80,
            2,
            options.playerAliases,
            options.playerIds,
            options.tournamentId || undefined,
            handleScoreUpdate
        );
        createMatchDB(game);
        game.run();
    } else if (options.gameType === GameType.LOCAL_VS_AI) {
        // Set initial labels for CPU
        updateScoreBar('You', '0 - 0', 'CPU');
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
        createMatchDB(game);
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

        const game = new MainGame(
            'gameCanvas',
            options.gameType,
            100,
            80,
            2,
            { player1: 'Player 1', player2: 'Player 2' },
            undefined,
            options.tournamentId,
            handleScoreUpdate
        );
        game.run();

        // Real-time alias sync: send alias and listen for room_state
        const remoteController = (game as any)._remoteController;
        if (!remoteController) return;
        const gameService = remoteController.getGameService && remoteController.getGameService();
        if (!gameService) return;

        function sendAliasWhenConnected(gameService: any, alias: any, retries = 10) {
          if (gameService.isConnectedToServer()) {
              gameService.sendMessage('set_alias', { alias });
          } else if (retries > 0) {
              setTimeout(() => sendAliasWhenConnected(gameService, alias, retries - 1), 200);
          } else {
              console.error('WebSocket still not connected after retries.');
          }
        }
        // Send your alias to server
        // gameService.sendMessage && gameService.sendMessage('set_alias', { alias });
        sendAliasWhenConnected(gameService, alias);

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
    }

    // Optionally, restore sidebar when leaving the game page
    window.addEventListener('popstate', () => {
        if (sidebar) sidebar.style.display = '';
        if (app) app.style.marginLeft = '80px';
    }, { once: true });
};


/**
 * Create match in the database
 */
async function createMatchDB(game: any): Promise<void> {
    if (!game || game.matchSaved || !game.matchData) return;
    game.matchSaved = true;
    try {
        const matchData = {
            ...game.matchData,
            player1_score: 0,
            player2_score: 0,
            winner_id: null,
            roomId: game._remoteController?.getRoomId?.()
        };
        console.log('[debug] Creating match with data:', matchData);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/matches`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(matchData)
        });
        if (response.ok) {
            const result = await response.json();
            game.matchData.id = result.data.id;
            console.log('[debug] Match created successfully:', game.matchData.id);
        } else {
            console.error('[debug] Failed to create match:', response.status);
        }
    } catch (error) {
        game.matchSaved = false;
        console.error('[Match Create] Error creating match:', error);
    }
}

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

export default function gamePage(options: GamePageOptions): void {
    const app = document.getElementById('app');
    if (!app) {
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    app.innerHTML = '';
    app.appendChild(canvas);

    const game = new MainGame(
        'gameCanvas',
        options.gameType,
        100, // tableWidth
        80,  // tableDepth
        2,   // maxScore
        {
          player1: getDisplayName(options.playerIds?.player1 ?? 0, options.playerAliases.player1),
          player2: getDisplayName(options.playerIds?.player2 ?? 0, options.playerAliases.player2)
        },
        options.playerIds,
        options.tournamentId
    );
    game.run();
}

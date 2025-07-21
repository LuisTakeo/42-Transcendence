import { GameType, MainGame } from "../pong-game/game";

interface GamePageOptions {
    gameType: GameType;
    playerAliases: { player1: string; player2: string };
    playerIds?: { player1?: number; player2?: number };
    tournamentId?: number;
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
        options.playerAliases,
        options.playerIds,
        options.tournamentId
    );
    game.run();
}

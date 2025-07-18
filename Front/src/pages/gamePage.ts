import { GameType, MainGame } from "../pong-game/game";

export default function gamePage(gameType: GameType): string {
    const app = document.getElementById('app');
    if (!app) {
        return '<h1>Error: App element not found</h1>';
    }
    const canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    app.innerHTML = '';
    app.appendChild(canvas);
    const game = new MainGame('gameCanvas', gameType);
    game.run();
}
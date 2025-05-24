// import './counter';
import { MainGame } from './pong-game/game';


const app = document.getElementById('app');
const canvas = document.createElement('canvas');
canvas.id = 'gameCanvas';
canvas.style.width = '100%';
canvas.style.height = '100%';
app?.appendChild(canvas);
// window.addEventListener('DOMContentLoaded', () => {
//   // Create the game
//   new Game('gameCanvas');
// });

window.addEventListener('DOMContentLoaded', () => {
	const game = new MainGame('gameCanvas', 50, 50);
	game.run();
});
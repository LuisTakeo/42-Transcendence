// import './counter';
import { GameType } from './pong-game/game';
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
	// Cria o jogo com 2 jogadores no mesmo teclado
	const game = new MainGame('gameCanvas', GameType.LOCAL_VS_AI, 80, 60);
	game.run();
});
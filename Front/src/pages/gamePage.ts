import { MainGame, GameType } from "../pong-game/game";


export function GamePage(gameMode: string) {
	const app = document.getElementById("app");
	if (!app) return;
	app.innerHTML = ""; // Clear existing content

	const canvas = document.createElement("canvas");
	canvas.id = "gameCanvas";
	canvas.style.width = "100%";
	canvas.style.height = "100%";
	app.appendChild(canvas);
	const gameType = gameMode === "classic" ? GameType.LOCAL_TWO_PLAYERS : GameType.LOCAL_VS_AI;
	const game = new MainGame("gameCanvas", gameType, 100, 80, 10);
	game.run();
	window.addEventListener("beforeunload", () => {
		game.dispose();
	});
}


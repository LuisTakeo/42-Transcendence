// main.ts
import { PongGame } from "./PongGame";
import { PongInputAdapter } from "./PongInputAdapter";

const app = document.getElementById("app");
const canvas = document.createElement("canvas");
canvas.id = "gameCanvas";
canvas.width = 600;
canvas.height = 400;
app?.appendChild(canvas);

console.log("oi")

const game = new PongGame(canvas);
const input = new PongInputAdapter(game);

function gameLoop() {
  input.handleInput();
  game.update();
  game.draw();
  requestAnimationFrame(gameLoop);
}

console.log("oi2")
gameLoop();

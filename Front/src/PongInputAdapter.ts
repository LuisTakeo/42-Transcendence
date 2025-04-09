// PongInputAdapter.ts
import { PongGame } from "./PongGame";

export class PongInputAdapter {
  private game: PongGame;
  private keyMap: Record<string, boolean> = {};

  constructor(game: PongGame) {
    this.game = game;
    this.bindEvents();
  }

  private bindEvents(): void {
    window.addEventListener("keydown", (e) => {
      this.keyMap[e.key] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keyMap[e.key] = false;
    });
  }

  public handleInput(): void {
    if (this.keyMap["ArrowUp"]) {
      this.game.movePlayer(-6);
    }
    if (this.keyMap["ArrowDown"]) {
      this.game.movePlayer(6);
    }
  }
}

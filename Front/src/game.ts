import {
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  ArcRotateCamera
} from "@babylonjs/core";

export class Game {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scene: Scene;

  constructor(canvasId: string) {
    // Get the canvas element
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;

    // Initialize the Babylon engine
    this.engine = new Engine(this.canvas, true);

    // Create a new scene
    this.scene = new Scene(this.engine);

    // Create camera
    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      10,
      new Vector3(0, 0, 0),
      this.scene
    );
    camera.attachControl(this.canvas, true);

    // Add a light
    const light = new HemisphericLight(
      "light",
      new Vector3(0, 1, 0),
      this.scene
    );

    // Create a sphere
    const sphere = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 2 },
      this.scene
    );

    // Start the render loop
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    // Handle browser resize
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }
}

const app = document.getElementById('app');
const canvas = document.createElement('canvas');
canvas.id = 'gameCanvas';
canvas.style.width = '100%';
canvas.style.height = '100%';
app?.appendChild(canvas);

window.addEventListener('DOMContentLoaded', () => {
  // Create the game
  new Game('gameCanvas');
});
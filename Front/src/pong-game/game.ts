import { Engine, Scene, Vector3 } from "@babylonjs/core";
import { TableManager } from "./objects/TableManager";
import { CameraManager } from "./core/CameraManager";
import { LightManager } from "./core/LightManager";
import { EnvironmentManager } from "./core/EnvironmentManager";

/**
 * Main class for managing the Babylon.js application
 */
class MainGame {
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    private scene: Scene;

    // Managers
    private cameraManager: CameraManager;
    private lightManager: LightManager;
    private environmentManager: EnvironmentManager;
    private tableManager: TableManager;

    /**
     * Constructor for the main class
     * @param canvasId ID of the canvas element in HTML
     */
    constructor(canvasId: string) {
        // Get canvas reference
        this.canvas = document.getElementById(canvasId) as unknown as HTMLCanvasElement;
        console.log("teste AAAAAAa");
        if (!this.canvas) throw new Error(`Canvas with ID "${canvasId}" not found`);

        // Initialize Babylon engine
        this.engine = new Engine(this.canvas, true);

        // Create scene
        this.scene = new Scene(this.engine);

        // Initialize managers
        this.cameraManager = new CameraManager(this.scene, this.canvas);
        this.lightManager = new LightManager(this.scene);
        this.environmentManager = new EnvironmentManager(this.scene);
        this.tableManager = new TableManager(this.scene);
    }

    /**
     * Initialize the scene with basic elements
     */
    private initializeScene(): void {
        // Set background color
        this.scene.clearColor.set(0, 0.7, 1, 1);

        // Initialize components
        this.cameraManager.createCamera(new Vector3(10, 80, -100));
        this.lightManager.createLights();
        this.environmentManager.createGround();
        this.tableManager.createTable();
    }

    /**
     * Start the rendering loop
     */
    public run(): void {
        // Initialize the scene
        this.initializeScene();

        // Register the rendering loop
        this.engine.runRenderLoop(() => {
            this.update();
            this.scene.render();
        });

        // Adjust canvas size when window is resized
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    /**
     * Update method called every frame
     * Here you can add logic that should be executed on each frame
     */
    public update(): void {
        // Update game components
        this.tableManager.update();

        // Exemplo de como adicionar controles do jogador para o paddle direito
        const paddle = this.tableManager.getPaddleRight();
        const moveLimit = 20; // Ajuste conforme necessário

        // Verifique as teclas pressionadas
        // Você precisará implementar a lógica para capturar teclas
        if (this.keyDown('ArrowUp')) {
            paddle.moveUp(moveLimit);
        }
        if (this.keyDown('ArrowDown')) {
            paddle.moveDown(moveLimit);
        }
    }

    // Método para verificar teclas pressionadas
    private keyDown(key: string): boolean {
        // Você precisará implementar um sistema de captura de teclas
        // Por exemplo, usando um objeto que armazena o estado das teclas
        return false;
    }
}

export { MainGame };
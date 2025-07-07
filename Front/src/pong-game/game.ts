import { Engine, Scene, Vector3 } from "@babylonjs/core";
import { TableManager } from "./objects/TableManager";
import { CameraManager } from "./core/CameraManager";
import { LightManager } from "./core/LightManager";
import { EnvironmentManager } from "./core/EnvironmentManager";
import { InputManager } from "./core/InputManager";
import { KeyboardController } from "./adapters/KeyboardController";
import { AIController } from "./adapters/AIController";
import { RemoteController } from "./adapters/RemoteController";
import { TextBlock, AdvancedDynamicTexture, Control, Rectangle } from "@babylonjs/gui";

/**
 * Tipos de jogo disponíveis
 */
export enum GameType {
    LOCAL_TWO_PLAYERS = "local_two_players",  // 2 jogadores no mesmo teclado
    LOCAL_VS_AI = "local_vs_ai",              // 1 jogador contra IA
    REMOTE = "remote"                         // Jogo online (remoto)
}

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
    private inputManager: InputManager;

    // Tipo de jogo
    private gameType: GameType;

    // Textures for GUI
    private advancedTexture: AdvancedDynamicTexture;
    private scoreText: TextBlock;
    private instructionsText: TextBlock;
    // Score tracking
    private score: { player1: number, player2: number };

    /**
     * Constructor for the main class
     * @param canvasId ID of the canvas element in HTML
     * @param gameType Tipo de jogo a ser iniciado
     * @param tableWidth Largura da mesa
     * @param tableDepth Profundidade da mesa
     */    constructor(
        canvasId: string,
        gameType: GameType = GameType.LOCAL_TWO_PLAYERS,
        tableWidth: number = 100,
        tableDepth: number = 80
    ) {
        // Get canvas reference
        this.canvas = document.getElementById(canvasId) as unknown as HTMLCanvasElement;
        if (!this.canvas) throw new Error(`Canvas with ID "${canvasId}" not found`);

        // Armazena o tipo de jogo
        this.gameType = gameType;
        this.score = { player1: 0, player2: 0 };

        // Initialize Babylon engine
        this.engine = new Engine(this.canvas, true);

        // Create scene
        this.scene = new Scene(this.engine);

        // Initialize managers
        this.cameraManager = new CameraManager(this.scene, this.canvas);
        this.lightManager = new LightManager(this.scene);
        this.environmentManager = new EnvironmentManager(this.scene);
        this.tableManager = new TableManager(this.scene, tableWidth, tableDepth);
        this.inputManager = new InputManager();
        // Inicializa a textura avançada para GUI
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        // Inicializa os elementos de GUI
        this.initializeScoreBox();
        this.initializeInstructionsBox();
    }    /**
     * Initialize the scene with basic elements
     */
    private initializeScene(): void {
        // Set background color
        this.scene.clearColor.set(0, 0.7, 1, 1);

        // Initialize components
        this.cameraManager.createCamera(new Vector3(10, 80, -100));
        this.lightManager.createLights();
        this.environmentManager.createGround();

        this.tableManager.setShadowGenerator(this.lightManager.getShadowGenerator());
        this.tableManager.createTable();

        // Configurar controladores de input com base no tipo de jogo
        this.setupInputBasedOnGameType();

        // Configurar sombras no chão
        const ground = this.environmentManager.getGround();
        if (ground) {
            ground.receiveShadows = true;
        }
    }

    /**
     * Inicializa o retângulo e texto para o score
     */
    private initializeScoreBox(): void {
        const scoreBox = new Rectangle("scoreBox");
        scoreBox.width = "200px"; // Largura do bloco
        scoreBox.height = "50px"; // Altura do bloco
        scoreBox.background = "rgba(0, 0, 0, 0.5)"; // Fundo preto com 50% de transparência
        scoreBox.cornerRadius = 10; // Bordas arredondadas
        scoreBox.thickness = 0; // Sem borda
        scoreBox.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        scoreBox.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        scoreBox.left = "10px"; // Margem da esquerda
        scoreBox.top = "10px"; // Margem do topo

        this.scoreText = new TextBlock("scoreText", "Score: 0 - 0");
        this.scoreText.color = "white";
        this.scoreText.fontSize = 20;
        scoreBox.addControl(this.scoreText);

        this.advancedTexture.addControl(scoreBox);
    }

    /**
     * Inicializa o retângulo e texto para as instruções
     */
    private initializeInstructionsBox(): void {
        const instructionsBox = new Rectangle("instructionsBox");
        instructionsBox.width = "300px"; // Largura do bloco
        instructionsBox.height = "100px"; // Altura do bloco
        instructionsBox.background = "rgba(0, 0, 0, 0.5)"; // Fundo preto com 50% de transparência
        instructionsBox.cornerRadius = 10; // Bordas arredondadas
        instructionsBox.thickness = 0; // Sem borda
        instructionsBox.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        instructionsBox.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        instructionsBox.top = "-100px"; // Margem do fundo

        this.instructionsText = new TextBlock("instructionsText", "Use as setas para mover!");
        this.instructionsText.color = "white";
        this.instructionsText.fontSize = 20;
        instructionsBox.addControl(this.instructionsText);

        this.advancedTexture.addControl(instructionsBox);
    }

    /**
     * Configura os controladores de input com base no tipo de jogo
     */
    private setupInputBasedOnGameType(): void {
        const leftPaddle = this.tableManager.getPaddleLeft();
        const rightPaddle = this.tableManager.getPaddleRight();
        const ball = this.tableManager.getBall();

        switch (this.gameType) {
            case GameType.LOCAL_TWO_PLAYERS:
                this.instructionsText.text = "Use W/S para Jogador 1\nSetas para Jogador 2";
                // 2 jogadores locais no mesmo teclado
                const player1Controller = new KeyboardController(
                    "player1_keyboard",
                    this.scene,
                    "w",  // Tecla para cima
                    "s",   // Tecla para baixo
                    0.5,  // Velocidade de movimento
                    this.tableManager.getTableWidth(),
                    this.tableManager.getTableDepth()
                );

                const player2Controller = new KeyboardController(
                    "player2_keyboard",
                    this.scene,
                    "ArrowUp",    // Tecla para cima
                    "ArrowDown",
                    0.5,  // Velocidade de movimento
                    this.tableManager.getTableWidth(),
                    this.tableManager.getTableDepth()
                );

                this.inputManager.registerController(player1Controller);
                this.inputManager.registerController(player2Controller);

                this.inputManager.connectControllerToPaddle("player1_keyboard", leftPaddle);
                this.inputManager.connectControllerToPaddle("player2_keyboard", rightPaddle);
                break;

            case GameType.LOCAL_VS_AI:
                this.instructionsText.text = "Use as setas para mover\nIA controla o paddle direito";
                // 1 jogador contra IA
                const playerController = new KeyboardController(
                    "player_keyboard",
                    this.scene,
                    "ArrowUp",
                    "ArrowDown",
                    0.5,  // Velocidade de movimento
                    this.tableManager.getTableWidth(),
                    this.tableManager.getTableDepth()
                );

                const aiController = new AIController(
                    "ai_controller",
                    this.scene,
                    ball,                    // Passa a bola para a IA seguir
                    0.8,                     // Dificuldade média
                    0.5,                     // Velocidade de movimento
                    this.tableManager.getTableWidth(),  // Largura da mesa
                    this.tableManager.getTableDepth()   // Profundidade da mesa
                );

                this.inputManager.registerController(playerController);
                this.inputManager.registerController(aiController);

                // O jogador controla o paddle direito, a IA controla o esquerdo
                this.inputManager.connectControllerToPaddle("player_keyboard", leftPaddle);
                this.inputManager.connectControllerToPaddle("ai_controller", rightPaddle);
                break;

            case GameType.REMOTE:
                this.instructionsText.text = "Use as setas para mover";
                // Jogo remoto (online)
                const localController = new KeyboardController(
                    "local_player",
                    this.scene,
                    "ArrowUp",
                    "ArrowDown"
                );

                const remoteController = new RemoteController(
                    "remote_player"
                );

                this.inputManager.registerController(localController);
                this.inputManager.registerController(remoteController);

                // Assume que o jogador local é sempre o paddle direito
                // Isso pode mudar dependendo da sua lógica de rede
                this.inputManager.connectControllerToPaddle("local_player", rightPaddle);
                this.inputManager.connectControllerToPaddle("remote_player", leftPaddle);
                break;            default:
                console.warn(`Tipo de jogo desconhecido: ${this.gameType}, usando modo dois jogadores.`);
                // Configuração padrão (dois jogadores)
                this.gameType = GameType.LOCAL_TWO_PLAYERS;
                // Configurar dois jogadores no teclado
                const defaultPlayer1 = new KeyboardController(
                    "player1_default",
                    this.scene,
                    "w",
                    "s"
                );
                const defaultPlayer2 = new KeyboardController(
                    "player2_default",
                    this.scene,
                    "ArrowUp",
                    "ArrowDown"
                );

                this.inputManager.registerController(defaultPlayer1);
                this.inputManager.registerController(defaultPlayer2);

                this.inputManager.connectControllerToPaddle("player1_default", leftPaddle);
                this.inputManager.connectControllerToPaddle("player2_default", rightPaddle);
                break;
        }
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
    public update(): void {
        // Calcular delta time para movimentos suaves
        const deltaTime = this.engine.getDeltaTime() / 1000;

        // Atualizar controladores de input
        this.inputManager.update(deltaTime);

        // Atualizar componentes do jogo (bola e colisões)
        this.tableManager.update();
    }


    public getGameType(): GameType {
        return this.gameType;
    }


    public dispose(): void {
        this.inputManager.dispose();
        this.scene.dispose();
        this.engine.dispose();
    }
}

export { MainGame };
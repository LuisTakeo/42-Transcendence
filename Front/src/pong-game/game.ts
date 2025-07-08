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
import { IInputController } from "./ports/IInputController";

/**
 * Tipos de jogo disponíveis
 */
export enum GameType {
    LOCAL_TWO_PLAYERS = "local_two_players",  // 2 jogadores no mesmo teclado
    LOCAL_VS_AI = "local_vs_ai",              // 1 jogador contra IA
    REMOTE = "remote"                         // Jogo online (remoto)
}

export enum LevelAI {
    EASY = 10,   // Fácil
    MEDIUM = 50, // Médio
    HARD = 100,   // Difícil
    EXPERT = 200, // Expert
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
    private maxScore: number;

    /**
     * Constructor for the main class
     * @param canvasId ID of the canvas element in HTML
     * @param gameType Tipo de jogo a ser iniciado
     * @param tableWidth Largura da mesa
     * @param tableDepth Profundidade da mesa
     */    
    constructor(
        canvasId: string,
        gameType: GameType = GameType.LOCAL_TWO_PLAYERS,
        tableWidth: number = 100,
        tableDepth: number = 80,
        maxScore: number = 10 
    ) {
        this.canvas = document.getElementById(canvasId) as unknown as HTMLCanvasElement;
        if (!this.canvas) throw new Error(`Canvas with ID "${canvasId}" not found`);

        this.gameType = gameType;
        this.score = { player1: 0, player2: 0 };
        this.maxScore = maxScore; 

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
        
        this.scoreText = new TextBlock("scoreText", "Score: 0 - 0");
        this.instructionsText = new TextBlock("instructionsText", "Use as setas para mover!");

        // Inicializa os elementos de GUI
        this.initializeScoreBox();
        this.initializeInstructionsBox();
    }    /**
     * Initialize the scene with basic elements
     */
    private initializeScene(): void {
        this.setupCamera();
        this.setupLights();
        this.setupEnvironment();
        this.setupTable();
        this.setupInput();
    }

    private setupCamera(): void {
        this.cameraManager.createCamera(new Vector3(-2, 120, -150));
    }

    private setupLights(): void {
        this.lightManager.createLights();
    }

    private setupEnvironment(): void {
        this.environmentManager.createGround();
    }

    private setupTable(): void {
        this.tableManager.setShadowGenerator(this.lightManager.getShadowGenerator());
        this.tableManager.createTable();
    }

    private setupInput(): void {
        this.setupInputBasedOnGameType();
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

        // this.scoreText = new TextBlock("scoreText", "Score: 0 - 0");
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
        instructionsBox.height = "60px"; // Altura do bloco
        instructionsBox.background = "rgba(0, 0, 0, 0.5)"; // Fundo preto com 50% de transparência
        instructionsBox.cornerRadius = 10; // Bordas arredondadas
        instructionsBox.thickness = 0; // Sem borda
        instructionsBox.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        instructionsBox.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        instructionsBox.top = "-10%"; // Margem do fundo

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
                this.registerControllers({
                    info: "player1_keyboard", 
                    controller: new KeyboardController(
                        "player1_keyboard", this.scene, "w", "s", 0.5,
                        this.tableManager.getTableWidth(),
                        this.tableManager.getTableDepth()
                    )
                },
                {
                    info: "player2_keyboard", 
                    controller: new KeyboardController(
                        "player2_keyboard",  this.scene,  "ArrowUp",  "ArrowDown",  0.5,
                        this.tableManager.getTableWidth(),
                        this.tableManager.getTableDepth())
                },
                "Use W/S para Jogador 1\nSetas para Jogador 2"
                );
                break;

            case GameType.LOCAL_VS_AI:
                this.registerControllers({   
                    info: "player_keyboard", 
                    controller: new KeyboardController( "player_keyboard",
                        this.scene, "ArrowUp", "ArrowDown", 0.5,
                        this.tableManager.getTableWidth(),
                        this.tableManager.getTableDepth()
                    )}, 
                    {   
                        info: "ai_controller", 
                    controller: new AIController(
                        "ai_controller", this.scene, ball, 0.8, 0.5,
                        this.tableManager.getTableWidth(),
                        this.tableManager.getTableDepth(),
                        LevelAI.EXPERT
                    )}, 
                    "Use as setas para mover\n"
                )
                break;

            case GameType.REMOTE:
                this.registerControllers({
                    info: "local_player", 
                    controller: new KeyboardController(
                        "local_player", this.scene, "ArrowUp", "ArrowDown", 0.5,
                        this.tableManager.getTableWidth(),
                        this.tableManager.getTableDepth()
                    )
                },
                {
                    info: "remote_player", 
                    controller: new RemoteController("remote_player")
                },
                "Use as setas para mover\n"
                )
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
                break;            
            default:
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

    private registerControllers(
        player1: {info: string, controller: IInputController}, 
        player2: {info: string, controller: IInputController},
        instructions: string): void {
        this.instructionsText.text = instructions;
        this.inputManager.registerController(player1.controller);
        this.inputManager.registerController(player2.controller);
        this.inputManager.connectControllerToPaddle(player1.info, this.tableManager.getPaddleLeft());
        this.inputManager.connectControllerToPaddle(player2.info, this.tableManager.getPaddleRight());
    }

    /**
     * Start the rendering loop
     */
    public run(): void {
        this.initializeScene();

        // Loop único para renderização e atualização
        this.engine.runRenderLoop(this.update.bind(this));

        // Ajustar tamanho do canvas ao redimensionar janela
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    // Refatoração do método update para simplificar lógica
    public update(): void {
        const deltaTime = this.engine.getDeltaTime() / 1000;

        // Atualizar todos os componentes
        this.inputManager.update(deltaTime);
        this.tableManager.update();
        this.updateScore();
        if (this.isFinished())
        {
            this.endGame();
            // return ;
        }

        this.scene.render();
    } 

    private endGame(): void {
        const winner = this.score.player1 >= this.maxScore ? "Player 1" : "Player 2";

        // Exibir mensagem de vitória
        const victoryText = new TextBlock("victoryText", `${winner} venceu!`);
        victoryText.color = "yellow";
        victoryText.fontSize = 40;
        victoryText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        victoryText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

        this.advancedTexture.addControl(victoryText);

        // Parar o loop de renderização
        this.engine.stopRenderLoop();
    }

    private isFinished(): boolean {
        return this.score.player1 >= this.maxScore || this.score.player2 >= this.maxScore
    }

    private updateScore(): void {
        // Check ball collision and update score
        const ball = this.tableManager.getBall();
        const collisionSide = ball.checkCollision();

        if (collisionSide) {
            if (collisionSide === "left") {
                this.score.player2++; // Player 2 scores
            } else if (collisionSide === "right") {
                this.score.player1++; // Player 1 scores
            }

            ball.resetPosition(); // Reset ball position
        }
        this.scoreText.text = `Score: ${this.score.player1} - ${this.score.player2}`;
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
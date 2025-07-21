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

interface RemoteStateReceive {
    paddleLeftPosition: Vector3;  // Posição do paddle esquerdo
    paddleRightPosition: Vector3; // Posição do paddle direito
    ballPosition: Vector3;         // Posição da bola
    ballVelocity: Vector3;         // Velocidade da bola
    score: { player1: number, player2: number }; // Pontuação atual
}

export interface RemoteStateSend {
    paddleMove: {
        paddleId: string; // ID do paddle que está se movendo
        direction: "up" | "down"; // Direção do movimento
    };

}

/**
 * Interface for match data
 */
interface MatchData {
    player1_id?: number;
    player2_id?: number;
    player1_alias: string;
    player2_alias: string;
    winner_id?: number | null;
    player1_score: number;
    player2_score: number;
    tournament_id?: number | null;
}

/**
 * Main class for managing the Babylon.js application
 */
class MainGame {
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    private scene: Scene;
    private cameraManager: CameraManager;
    private lightManager: LightManager;
    private environmentManager: EnvironmentManager;
    private tableManager: TableManager;
    private inputManager: InputManager;
    private gameType: GameType;

    private advancedTexture: AdvancedDynamicTexture;
    private scoreText: TextBlock;
    private instructionsText: TextBlock;
    private score: { player1: number, player2: number };
    private maxScore: number;
    private _remoteController: RemoteController | null = null;
    private gameEnded: boolean = false;

    // Match data for when game ends
    private matchData: MatchData | null = null;

    /**
     * Constructor for the main class
     * @param canvasId ID of the canvas element in HTML
     * @param gameType Tipo de jogo a ser iniciado
     * @param tableWidth Largura da mesa
     * @param tableDepth Profundidade da mesa
     * @param playerAliases Aliases dos jogadores (player1, player2)
     * @param playerIds IDs dos jogadores (player1, player2) - opcional
     * @param tournamentId ID do torneio se for jogo de torneio - opcional
     */
    constructor(
        canvasId: string,
        gameType: GameType = GameType.LOCAL_TWO_PLAYERS,
        tableWidth: number = 100,
        tableDepth: number = 80,
        maxScore: number = 1,
        playerAliases: { player1: string, player2: string },
        playerIds?: { player1?: number, player2?: number },
        tournamentId?: number
    ) {
        this.canvas = document.getElementById(canvasId) as unknown as HTMLCanvasElement;
        if (!this.canvas) throw new Error(`Canvas with ID "${canvasId}" not found`);

        this.gameType = gameType;
        this.score = { player1: 0, player2: 0 };
        this.maxScore = maxScore;

        // Store match data for when game ends
        this.matchData = {
            player1_id: playerIds?.player1,
            player2_id: playerIds?.player2,
            player1_alias: playerAliases.player1,
            player2_alias: playerAliases.player2,
            winner_id: null,
            player1_score: 0,
            player2_score: 0,
            tournament_id: tournamentId || null
        };

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
    }

    /**
     * Save match to database when game ends
     */
    private async saveMatchToDatabase(): Promise<void> {
        if (!this.matchData) return;

        try {
            if (!this.matchData.player1_id) {
                return;
            }

            // Use correct reserved user ID for player2_id if missing
            let player2_id = this.matchData.player2_id;
            if (!player2_id) {
                if (this.gameType === GameType.LOCAL_TWO_PLAYERS) {
                    player2_id = 999998;
                } else if (this.gameType === GameType.LOCAL_VS_AI) {
                    player2_id = 999999;
                } else {
                    player2_id = 0; // fallback, should never happen for remote
                }
            }

            const winnerId = this.score.player1 >= this.maxScore ?
                this.matchData.player1_id : player2_id;

            const matchData = {
                player1_id: this.matchData.player1_id,
                player2_id: player2_id,
                player1_alias: this.matchData.player1_alias,
                player2_alias: this.matchData.player2_alias,
                winner_id: winnerId,
                player1_score: this.score.player1,
                player2_score: this.score.player2,
                tournament_id: this.matchData.tournament_id
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/matches`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(matchData)
            });

            if (response.ok) {
                const result = await response.json();
            } else {
                const errorText = await response.text();
                console.error('Failed to save match:', response.status, errorText);
            }
        } catch (error) {
            console.error('Error saving match:', error);
        }
    }

    /**
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
                this._remoteController = new RemoteController("remote_controller");
                this._remoteController.initialize();
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

        if (this.gameType === GameType.REMOTE)
            this.engine.runRenderLoop(this.updateRemote.bind(this));
        else
            this.engine.runRenderLoop(this.update.bind(this));

        // Ajustar tamanho do canvas ao redimensionar janela
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    public updateRemote(): void
    {
        // const paddleLeft = this.tableManager.getPaddleLeft();
        // console.log("Paddle Left Position:");
        // console.log(paddleLeft.getMesh().position);
        // console.log(paddleLeft.getPaddleSize());

        // const paddleRight = this.tableManager.getPaddleRight();
        // console.log("Paddle Right Position:");
        // console.log(paddleRight.getMesh().position);
        // console.log(paddleRight.getPaddleSize());

        // const ball = this.tableManager.getBall();
        // console.log("Ball Position:");
        // console.log(ball.getMesh().position);
        // console.log(ball.getDiameter());

        this.scene.render();
    }

    public update(): void {
        const deltaTime = this.engine.getDeltaTime() / 1000;

        // Atualizar todos os componentes
        this.inputManager.update(deltaTime);
        this.tableManager.update();
        this.updateScore();
        if (this.isFinished())
        {
            this.endGame().catch(error => {
                console.error('Error ending game:', error);
            });
            // return ;
        }

        this.scene.render();
    }

    private async endGame(): Promise<void> {
        // Prevent multiple calls
        if (this.gameEnded) return;
        this.gameEnded = true;

        const winner = this.score.player1 >= this.maxScore ? "Player 1" : "Player 2";

        // Update match in database with final results
        await this.saveMatchToDatabase();

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

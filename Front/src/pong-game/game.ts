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
    private playerSide: 'left' | 'right' | null = null; // Lado do jogador no modo remoto
    private gameEnded: boolean = false; // Flag para evitar múltiplas mensagens de vitória

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
                console.log("Iniciando jogo remoto...");
                this._remoteController = new RemoteController("remote_controller");
                this._remoteController.initialize();
                
                // Configurar listeners para mensagens de vitória
                this.setupRemoteVictoryListeners();
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

    public updateRemote(): void {
        // Se o jogo já terminou, não continuar atualizando
        if (this.gameEnded) {
            return;
        }
        
        if (!this._remoteController) {
            console.log('RemoteController não inicializado');
            return;
        }
        const state = this._remoteController.getGameState();
        if (state) {
            // Atualizar bola
            const ball = this.tableManager.getBall();
            ball.updatePositionRemote(state.ball.x, state.ball.y);

            // Atualizar paddles
            const paddleLeft = this.tableManager.getPaddleLeft();
            paddleLeft.updatePositionRemote(state.player1.y);

            const paddleRight = this.tableManager.getPaddleRight();
            paddleRight.updatePositionRemote(state.player2.y);

            // Atualizar placar, se desejar
            this.scoreText.text = `Score: ${state.score.player1} - ${state.score.player2}`;

        }        
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
            this.endGame();
            // return ;
        }

        this.scene.render();
    } 

    private endGame(): void {
        // Verificar se o jogo já terminou
        if (this.gameEnded) return;
        
        // Marcar que o jogo terminou
        this.gameEnded = true;
        
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

    /**
     * Configura os listeners para mensagens de vitória no modo remoto
     */
    private setupRemoteVictoryListeners(): void {
        if (!this._remoteController) return;

        // Obter o GameService do RemoteController
        const gameService = this._remoteController.getGameService();
        if (!gameService) return;

        // Listener para vitória por pontuação máxima
        gameService.onMessage('game_over', (data: any) => {
            console.log('Jogo terminou:', data);
            this.handleRemoteVictory(data.winner, data.finalScore, 'Vitória por pontuação!');
        });

        // Listener para vitória por desconexão do adversário
        gameService.onMessage('end_game', (data: any) => {
            console.log('Jogo terminou por desconexão:', data);
            this.handleRemoteVictory(data.winner, null, data.message || 'Adversário desconectou');
        });

        // Listener para quando entrar em uma sala - para saber qual lado você está
        gameService.onMessage('room_created', (data: any) => {
            console.log('Sala criada, você está do lado:', data.side);
            this.playerSide = data.side;
        });

        gameService.onMessage('room_joined', (data: any) => {
            console.log('Entrou em uma sala, você está do lado:', data.side);
            this.playerSide = data.side;
        });
    }

    /**
     * Manipula a exibição de vitória no modo remoto
     */
    private handleRemoteVictory(winner: string, finalScore: any, reason: string): void {
        // Verificar se o jogo já terminou para evitar múltiplas mensagens
        if (this.gameEnded) {
            console.log('Jogo já terminou, ignorando nova mensagem de vitória');
            return;
        }

        // Marcar que o jogo terminou
        this.gameEnded = true;
        // Determinar se você ganhou ou perdeu
        let victoryMessage = '';
        let messageColor = 'yellow';
        
        if (this.playerSide && winner === this.playerSide) {
            victoryMessage = '🎉 VOCÊ VENCEU! 🎉';
            messageColor = 'purple';
        } else if (this.playerSide && winner !== this.playerSide) {
            victoryMessage = '😞 Você Perdeu';
            messageColor = 'red';
        } else {
            // Fallback caso não saibamos o lado do jogador
            if (winner === 'left') {
                victoryMessage = 'Jogador da Esquerda Venceu!';
            } else if (winner === 'right') {
                victoryMessage = 'Jogador da Direita Venceu!';
            } else {
                victoryMessage = 'Jogo Finalizado';
            }
        }

        // Criar container para a mensagem de vitória
        const victoryContainer = new Rectangle("victoryContainer");
        victoryContainer.widthInPixels = 500;
        victoryContainer.heightInPixels = 300;
        victoryContainer.background = "rgba(0, 0, 0, 0.9)";
        victoryContainer.cornerRadius = 20;
        victoryContainer.color = messageColor;
        victoryContainer.thickness = 4;
        victoryContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        victoryContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

        // Texto principal de vitória
        const victoryText = new TextBlock("victoryText", victoryMessage);
        victoryText.color = messageColor;
        victoryText.fontSize = 28;
        victoryText.fontWeight = "bold";
        victoryText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        victoryText.paddingTopInPixels = 40;

        // Texto do motivo
        const reasonText = new TextBlock("reasonText", reason);
        reasonText.color = "white";
        reasonText.fontSize = 16;
        reasonText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

        // Texto da pontuação final (se disponível)
        let scoreText: TextBlock | null = null;
        if (finalScore) {
            const leftScore = finalScore.player1;
            const rightScore = finalScore.player2;
            scoreText = new TextBlock("scoreText", 
                `Pontuação Final: ${leftScore} - ${rightScore}`);
            scoreText.color = "lightblue";
            scoreText.fontSize = 14;
            scoreText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
            scoreText.paddingBottomInPixels = 50;
        }

        // Texto informativo sobre o lado do jogador
        let sideText: TextBlock | null = null;
        if (this.playerSide) {
            sideText = new TextBlock("sideText", 
                `Você estava jogando como: ${this.playerSide === 'left' ? 'Esquerda' : 'Direita'}`);
            sideText.color = "lightgray";
            sideText.fontSize = 12;
            sideText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
            sideText.paddingBottomInPixels = 20;
        }

        // Adicionar elementos ao container
        victoryContainer.addControl(victoryText);
        victoryContainer.addControl(reasonText);
        if (scoreText) {
            victoryContainer.addControl(scoreText);
        }
        if (sideText) {
            victoryContainer.addControl(sideText);
        }

        // Adicionar container à interface
        this.advancedTexture.addControl(victoryContainer);

        this.scene.render();
        // Parar o loop de renderização
        this.engine.stopRenderLoop();

        // Log para debug
        console.log(`Jogo finalizado - Vencedor: ${winner}, Seu lado: ${this.playerSide}, Motivo: ${reason}`);
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
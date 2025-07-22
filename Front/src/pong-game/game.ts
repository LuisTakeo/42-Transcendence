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
import { showWinnerModal } from '../pages/gamePage';

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
    // Remove instructionsText and initializeInstructionsBox
    private score: { player1: number, player2: number };
    private maxScore: number;
    private _remoteController: RemoteController | null = null;
    private player1Alias: string;
    private player2Alias: string;
    private gameEnded: boolean = false;

    // Match data for when game ends
    private matchData: MatchData | null = null;
    private playerSide: 'left' | 'right' | null = null; // Lado do jogador no modo remoto

    private onScoreUpdate?: (player1: string, score1: number, player2: string, score2: number) => void;

    /**
     * Constructor for the main class
     * @param canvasId ID of the canvas element in HTML
     * @param gameType Tipo de jogo a ser iniciado
     * @param tableWidth Largura da mesa
     * @param tableDepth Profundidade da mesa
     * @param maxScore Pontuação máxima
     * @param playerAliases Aliases dos jogadores (player1, player2)
     * @param playerIds IDs dos jogadores (player1, player2) - opcional
     * @param tournamentId ID do torneio se for jogo de torneio - opcional
     */
    constructor(
        canvasId: string,
        gameType: GameType = GameType.LOCAL_TWO_PLAYERS,
        tableWidth: number = 100,
        tableDepth: number = 80,
        maxScore: number = 10,
        playerAliases: { player1: string, player2: string },
        playerIds?: { player1?: number, player2?: number },
        tournamentId?: number,
        onScoreUpdate?: (player1: string, score1: number, player2: string, score2: number) => void
    ) {
        this.canvas = document.getElementById(canvasId) as unknown as HTMLCanvasElement;
        if (!this.canvas) throw new Error(`Canvas with ID "${canvasId}" not found`);

        this.gameType = gameType;
        this.score = { player1: 0, player2: 0 };
        this.maxScore = maxScore;
        this.player1Alias = playerAliases.player1;
        this.player2Alias = playerAliases.player2;
        this.onScoreUpdate = onScoreUpdate;

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
        // Remove instructionsText and initializeInstructionsBox
    }

    /**
     * Save match to database when game ends
     */
    private async saveMatchToDatabase(): Promise<void> {
        console.log('[debug] saveMatchToDatabase called', this.matchData, this.gameType);
        if (!this.matchData) return;

        try {
            if (!this.matchData.player1_id) {
                return;
            }

            // Use correct reserved user ID for player2_id if missing
            let player2_id = this.matchData.player2_id;
            if (!player2_id) {
                if (this.gameType === GameType.LOCAL_TWO_PLAYERS) {
                    player2_id = 4;
                } else if (this.gameType === GameType.LOCAL_VS_AI) {
                    player2_id = 5;
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

            const authToken = localStorage.getItem('authToken');

            if (this.gameType === GameType.REMOTE) {
                console.log('[debug] Saving remote match to DB:', matchData);
            }

            console.log('[debug] Sending POST /matches with:', matchData);
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/matches`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(matchData)
            });
            console.log('[debug] Response status:', response.status);
            if (response.ok) {
                const result = await response.json();
                console.log('[debug] Match save response:', result);
            } else {
                const errorText = await response.text();
                console.error('[debug] Failed to save match:', response.status, errorText);
            }
        } catch (error) {
            console.error('[Match Save] Error saving match:', error);
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
        scoreBox.width = "420px"; // Increased width for longer text
        scoreBox.height = "50px";
        scoreBox.background = "rgba(0, 0, 0, 0.5)";
        scoreBox.cornerRadius = 10;
        scoreBox.thickness = 0;
        scoreBox.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        scoreBox.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        scoreBox.left = "10px";
        scoreBox.top = "10px";

        this.scoreText.color = "white";
        this.scoreText.fontSize = 20;
        this.scoreText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        scoreBox.addControl(this.scoreText);

        this.advancedTexture.addControl(scoreBox);
    }

    /**
     * Remove the instructions box initialization method
     */
    // private initializeInstructionsBox(): void { ... }

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
                });
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
                    )});
                break;

            case GameType.REMOTE:
                console.log("Iniciando jogo remoto...");
                let realUserId = localStorage.getItem('currentUserId');
                if (!realUserId) {
                    // Try to get from JWT token if available
                    const token = localStorage.getItem('authToken');
                    if (token) {
                        try {
                            const payload = JSON.parse(atob(token.split('.')[1]));
                            if (payload && payload.id) {
                                realUserId = payload.id.toString();
                                localStorage.setItem('currentUserId', realUserId);
                            }
                        } catch (e) {
                            console.error('[DEBUG] Failed to decode JWT for user ID:', e);
                        }
                    }
                }

                this._remoteController = new RemoteController((realUserId ?? 'unknown').toString());
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
        player2: {info: string, controller: IInputController}): void {
        // Remove instructions argument and instructionsText update
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
            // Update the DOM score bar in real time
            if (this.onScoreUpdate) {
                this.onScoreUpdate(this.player1Alias, state.score.player1, this.player2Alias, state.score.player2);
            }
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

        const winner = this.score.player1 >= this.maxScore ? this.player1Alias : this.player2Alias;

        // Update match in database with final results
        await this.saveMatchToDatabase();

        // Show the HTML winner modal
        showWinnerModal(
            winner,
            () => { window.location.reload(); }, // Play again
            () => {
                window.history.pushState({}, '', '/home');
                window.dispatchEvent(new Event('popstate'));
            }
        );

        // Optionally, keep or remove the BabylonJS overlay
        const victoryText = new TextBlock("victoryText", `${winner} venceu!`);
        victoryText.color = "yellow";
        victoryText.fontSize = 40;
        victoryText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        victoryText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.advancedTexture.addControl(victoryText);

        // Stop the render loop
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
            this.playerSide = data.side;
            if (this.gameType === GameType.REMOTE && this.matchData) {
                this.matchData.player1_id = data.side === 'left' ? parseInt(data.userId) : parseInt(data.opponentId);
                this.matchData.player2_id = data.side === 'right' ? parseInt(data.userId) : parseInt(data.opponentId);
            }
        });

        gameService.onMessage('room_joined', (data: any) => {
            this.playerSide = data.side;
            if (this.gameType === GameType.REMOTE && this.matchData) {
                this.matchData.player1_id = data.side === 'left' ? parseInt(data.userId) : parseInt(data.opponentId);
                this.matchData.player2_id = data.side === 'right' ? parseInt(data.userId) : parseInt(data.opponentId);
            }
        });
    }

    /**
     * Manipula a exibição de vitória no modo remoto
     */
    private async handleRemoteVictory(winner: string, finalScore: any, reason: string): Promise<void> {
        // Verificar se o jogo já terminou para evitar múltiplas mensagens
        if (this.gameEnded) {
            console.log('Jogo já terminou, ignorando nova mensagem de vitória');
            return;
        }

        // Marcar que o jogo terminou
        this.gameEnded = true;

        // Save the match to the database
        await this.saveMatchToDatabase();

        // Determine winner alias for modal
        let winnerAlias = winner;
        if (winner === 'left') {
            winnerAlias = this.player1Alias;
        } else if (winner === 'right') {
            winnerAlias = this.player2Alias;
        }

        // Show the HTML winner modal (added)
        showWinnerModal(
            winnerAlias,
            () => { window.location.reload(); }, // Play again
            () => {
                window.history.pushState({}, '', '/home');
                window.dispatchEvent(new Event('popstate'));
            }
        );

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
            this.playerSide = data.side;
            if (this.gameType === GameType.REMOTE && this.matchData) {
                this.matchData.player1_id = data.side === 'left' ? parseInt(data.userId) : parseInt(data.opponentId);
                this.matchData.player2_id = data.side === 'right' ? parseInt(data.userId) : parseInt(data.opponentId);
            }
        });

        gameService.onMessage('room_joined', (data: any) => {
            this.playerSide = data.side;
            if (this.gameType === GameType.REMOTE && this.matchData) {
                this.matchData.player1_id = data.side === 'left' ? parseInt(data.userId) : parseInt(data.opponentId);
                this.matchData.player2_id = data.side === 'right' ? parseInt(data.userId) : parseInt(data.opponentId);
            }
        });
    }

    /**
     * Manipula a exibição de vitória no modo remoto
     */
    private async handleRemoteVictory(winner: string, finalScore: any, reason: string): Promise<void> {
        // Verificar se o jogo já terminou para evitar múltiplas mensagens
        if (this.gameEnded) {
            console.log('Jogo já terminou, ignorando nova mensagem de vitória');
            return;
        }

        // Marcar que o jogo terminou
        this.gameEnded = true;

        // Save the match to the database
        await this.saveMatchToDatabase();

        // Determine winner alias for modal
        let winnerAlias = winner;
        if (winner === 'left') {
            winnerAlias = this.player1Alias;
        } else if (winner === 'right') {
            winnerAlias = this.player2Alias;
        }

        // Show the HTML winner modal (added)
        showWinnerModal(
            winnerAlias,
            () => { window.location.reload(); }, // Play again
            () => {
                window.history.pushState({}, '', '/home');
                window.dispatchEvent(new Event('popstate'));
            }
        );

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
        let leftLabel = this.player1Alias;
        let rightLabel = this.player2Alias;
        if (this.gameType === GameType.LOCAL_VS_AI) {
            leftLabel = "You";
            rightLabel = "CPU";
        }
        this.scoreText.text = `Score: ${leftLabel} ${this.score.player1} - ${this.score.player2} ${rightLabel}`;
        if (this.onScoreUpdate) {
            this.onScoreUpdate(leftLabel, this.score.player1, rightLabel, this.score.player2);
        }
    }


    public getGameType(): GameType {
        return this.gameType;
    }

    public setPlayerInfo(player1Id: number, player1Alias: string, player2Id: number, player2Alias: string) {
        if (this.matchData) {
            this.matchData.player1_id = player1Id;
            this.matchData.player2_id = player2Id;
            this.matchData.player1_alias = player1Alias;
            this.matchData.player2_alias = player2Alias;
        }
        this.player1Alias = player1Alias;
        this.player2Alias = player2Alias;
    }


    public dispose(): void {
        this.inputManager.dispose();
        this.scene.dispose();
        this.engine.dispose();
    }
}

export { MainGame };

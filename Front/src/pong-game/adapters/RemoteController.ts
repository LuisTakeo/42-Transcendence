import { IInputController } from "../ports/IInputController";
import { Paddle } from "../objects/Paddle";
import { GameService, GameState } from "../game.service";

/**
 * Controlador que simula um input remoto (rede)
 * Em uma implementação real, este controlador receberia dados da rede
 */
export class RemoteController implements IInputController {
    private id: string;
    private paddle: Paddle | null = null;
    private initialized: boolean = false;
    private moveDirection: number = 0;
    private paddleSize: { width: number; height: number; depth: number };

    private upKey: string = "ArrowUp"; // Tecla para mover para cima
    private downKey: string = "ArrowDown"; // Tecla para mover para baixo
    private _onKeyDown: ((evt: KeyboardEvent) => void) | null = null;
    private _onKeyUp: ((evt: KeyboardEvent) => void) | null = null;
    private _gameService: GameService | null = null; // Simulação de conexão com servidor remoto

    /**
     * Cria um novo controlador remoto
     * @param id Identificador único do controlador
     */
    constructor(id: string) {
        this.id = id;
        this.paddleSize = { width: 1, height: 4, depth: 10 }; // Tamanho padrão do paddle
        // Use VITE_API_BASE_URL for the backend URL
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        let wsUrl;
        if (baseUrl.startsWith('https://')) {
            wsUrl = baseUrl.replace(/^https:\/\//, 'wss://') + '/ws';
        } else if (baseUrl.startsWith('http://')) {
            wsUrl = baseUrl.replace(/^http:\/\//, 'ws://') + '/ws';
        } else {
            wsUrl = baseUrl + '/ws';
        }
        this._gameService = new GameService(wsUrl, this.id);
    }

    public connect(): void {
        if (!this._gameService) return;

        this._gameService.connect();
        // console.log(`Controlador remoto ${this.id} conectado`);
    }

    /**
     * Retorna o ID do controlador
     */
    public getId(): string {
        return this.id;
    }

    /**
     * Retorna o paddle conectado
     */
    public getPaddle(): Paddle | null {
        return this.paddle;
    }


    /**
     * Conecta o controlador a um paddle específico
     */
    public connectToPaddle(paddle: Paddle): void {
        this.paddle = paddle;
    }

    /**
     * Desconecta o paddle atual
     */
    public disconnectPaddle(): void {
        this.paddle = null;
    }

    /**
     * Inicializa o controlador
     * Em uma implementação real, estabeleceria conexão com servidor
     */
    public initialize(): void {
        if (this.initialized || !this._gameService) return;
        this.initialized = true;
        this.connect();

        const connectionCheck = setInterval(() => {
        if (this._gameService?.isConnectedToServer()) {
                // console.log("WebSocket connected, setting up handlers");
                this.setupEventHandlers();
                clearInterval(connectionCheck);
            }
        }, 500);
        // Simular inicialização de conexão remota
        // console.log(`Controlador remoto ${this.id} inicializado`);




    }

    public getGameState(): GameState | null {
        return this._gameService?.getGameState() || null;
    }

    /**
     * Obtém o GameService para configurar listeners externos
     */
    public getGameService(): GameService | null {
        return this._gameService;
    }

    /**
     * Atualiza o paddle com base no input remoto simulado
     */
    public update(deltaTime: number): void {
        if (!this.initialized || !this.paddle) return;


    }

    public setupEventHandlers(): void {
        if (!this._gameService) return;
        // Configura os event listeners do teclado
        const handleKeyDown = (evt: KeyboardEvent) => {
            if (!this._gameService) return;
            if (evt.key === this.upKey || evt.key === this.downKey) {
                const direction = evt.key === this.upKey ? "up" : "down";
                this._gameService.sendMessage("player_move", {
                    direction: direction,
                    pressed: true
                });
            }
        };

        const handleKeyUp = (evt: KeyboardEvent) => {
            if (!this._gameService) return;
            if (evt.key === this.upKey || evt.key === this.downKey) {
                const direction = evt.key === this.upKey ? "up" : "down";
                this._gameService.sendMessage("player_move", {
                    direction: direction,
                    pressed: false
                });
            }
        };

        this._onKeyDown = handleKeyDown;
        this._onKeyUp = handleKeyUp;

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
    }

    /**
     * Recebe dados de movimento da rede
     * Em uma implementação real, seria chamado quando chegar dados da rede
     */
    public receiveMoveCommand(direction: number): void {
        this.moveDirection = direction;
    }

    /**
     * Limpa os recursos
     * Em uma implementação real, fecharia a conexão com o servidor
     */
    public dispose(): void {
        // console.log(`Controlador remoto ${this.id} desconectado`);

        // Remover event listeners se foram adicionados
        if (this._onKeyDown) {
            window.removeEventListener('keydown', this._onKeyDown);
            this._onKeyDown = null;
        }

        if (this._onKeyUp) {
            window.removeEventListener('keyup', this._onKeyUp);
            this._onKeyUp = null;
        }

        this.paddle = null;
        this.initialized = false;
    }
}

import { IInputController } from "../ports/IInputController";
import { Paddle } from "../objects/Paddle";
import { GameService } from "../game.service";

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
        this._gameService = new GameService("ws://localhost:3142/ws", this.id); // Simulação de serviço de jogo

    }

    public connect(): void {
        if (!this._gameService) return;

        this._gameService.connect();
        console.log(`Controlador remoto ${this.id} conectado`);
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
                console.log("WebSocket connected, setting up handlers");
                this.setupEventHandlers();
                clearInterval(connectionCheck);
            }
        }, 500);
        // Simular inicialização de conexão remota
        console.log(`Controlador remoto ${this.id} inicializado`);




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
                this.moveDirection = evt.key === this.upKey ? 1 : -1;
                this._gameService.sendMessage("player_move", { direction: this.moveDirection });
            }
        };

        const handleKeyUp = (evt: KeyboardEvent) => {
            if (evt.key === this.upKey || evt.key === this.downKey) {
                this.moveDirection = 0;
                this._gameService?.sendMessage("player_move", { direction: this.moveDirection });
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
        console.log(`Controlador remoto ${this.id} desconectado`);
        this.paddle = null;
        this.initialized = false;

    }
}
import { IInputController } from "../ports/IInputController";
import { Paddle } from "../objects/Paddle";

/**
 * Controlador que simula um input remoto (rede)
 * Em uma implementação real, este controlador receberia dados da rede
 */
export class RemoteController implements IInputController {
    private id: string;
    private paddle: Paddle | null = null;
    private initialized: boolean = false;
    private moveDirection: number = 0;

    /**
     * Cria um novo controlador remoto
     * @param id Identificador único do controlador
     */
    constructor(id: string) {
        this.id = id;
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
        this.initialized = true;
        // Simular inicialização de conexão remota
        console.log(`Controlador remoto ${this.id} inicializado`);
    }

    /**
     * Atualiza o paddle com base no input remoto simulado
     */
    public update(deltaTime: number): void {
        if (!this.initialized || !this.paddle) return;

        // Em um caso real, você receberia esta direção da rede
        // Para fins de simulação, estamos apenas movendo aleatoriamente
        if (Math.random() < 0.05) {
            this.moveDirection = (Math.random() > 0.5) ? 1 : -1;
        }

        if (Math.random() < 0.1) {
            this.moveDirection = 0;
        }        if (this.moveDirection !== 0) {
            // Limite de movimento
            const moveLimit = 35;

            if (this.moveDirection < 0) {
                this.paddle.moveUp(moveLimit);
            } else {
                this.paddle.moveDown(moveLimit);
            }
        }
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
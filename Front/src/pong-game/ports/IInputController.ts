import { Paddle } from "../objects/Paddle";

/**
 * Interface para controladores de input do jogo
 * Define os métodos que qualquer controlador precisa implementar
 */
export interface IInputController {
    /**
     * Conecta o controlador ao paddle
     * @param paddle O paddle que será controlado
     */
    connectToPaddle(paddle: Paddle): void;

    /**
     * Desconecta o paddle atual
     */
    disconnectPaddle(): void;

    /**
     * Atualiza o estado do controle, chamado a cada frame
     * @param deltaTime Tempo desde o último frame (em segundos)
     */
    update(deltaTime: number): void;

    /**
     * Inicializa o controlador e configura os eventos necessários
     */
    initialize(): void;

    /**
     * Desconecta e limpa recursos do controlador
     */
    dispose(): void;

    /**
     * Retorna o ID do controlador
     */
    getId(): string;

    /**
     * Retorna o paddle conectado ou null se não houver
     */
    getPaddle(): Paddle | null;
}
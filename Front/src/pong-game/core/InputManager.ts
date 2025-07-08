import { Scene } from "@babylonjs/core";
import { IInputController } from "../ports/IInputController";
import { Paddle } from "../objects/Paddle";

/**
 * Gerencia os controladores de input do jogo de forma modular
 */
export class InputManager {
    private controllers: Map<string, IInputController> = new Map();
    private paddleControllers: Map<Paddle, IInputController> = new Map();

    /**
     * Adiciona um controlador ao gerenciador
     * @param controller O controlador a ser adicionado
     */
    public registerController(controller: IInputController): void {
        const id = controller.getId();

        // Se já existir um controlador com este ID, descarte-o primeiro
        if (this.controllers.has(id)) {
            this.unregisterController(id);
        }

        this.controllers.set(id, controller);
        controller.initialize();
    }

    /**
     * Remove um controlador do gerenciador
     * @param controllerId ID do controlador a ser removido
     */
    public unregisterController(controllerId: string): void {
        const controller = this.controllers.get(controllerId);
        if (!controller) return;

        // Desconectar o paddle conectado, se houver
        const paddle = controller.getPaddle();
        if (paddle) {
            this.paddleControllers.delete(paddle);
        }

        controller.dispose();
        this.controllers.delete(controllerId);
    }

    /**
     * Conecta um controlador a um paddle
     * @param controllerId ID do controlador
     * @param paddle O paddle a ser controlado
     */
    public connectControllerToPaddle(controllerId: string, paddle: Paddle): void {
        const controller = this.controllers.get(controllerId);
        if (!controller) return;

        // Verifica se o paddle já está sendo controlado
        const currentController = this.paddleControllers.get(paddle);
        if (currentController && currentController !== controller) {
            currentController.disconnectPaddle();
        }

        // Verifica se o controlador já está controlando outro paddle
        const currentPaddle = controller.getPaddle();
        if (currentPaddle && currentPaddle !== paddle) {
            controller.disconnectPaddle();
        }

        // Conecta o controlador ao paddle
        controller.connectToPaddle(paddle);
        this.paddleControllers.set(paddle, controller);
    }

    /**
     * Desconecta qualquer controlador do paddle especificado
     * @param paddle O paddle a ser desconectado
     */
    public disconnectPaddle(paddle: Paddle): void {
        const controller = this.paddleControllers.get(paddle);
        if (controller) {
            controller.disconnectPaddle();
            this.paddleControllers.delete(paddle);
        }
    }

    /**
     * Atualiza todos os controladores registrados
     * @param deltaTime Tempo desde o último frame
     */
    public update(deltaTime: number): void {
        this.controllers.forEach(controller => {
            controller.update(deltaTime);
        });
    }

    /**
     * Limpa todos os recursos
     */
    public dispose(): void {
        this.controllers.forEach(controller => {
            controller.dispose();
        });
        this.controllers.clear();
        this.paddleControllers.clear();
    }

    /**
     * Retorna o controlador pelo ID
     */
    public getController(controllerId: string): IInputController | undefined {
        return this.controllers.get(controllerId);
    }

    /**
     * Retorna o controlador associado a um paddle
     */
    public getPaddleController(paddle: Paddle): IInputController | undefined {
        return this.paddleControllers.get(paddle);
    }
}
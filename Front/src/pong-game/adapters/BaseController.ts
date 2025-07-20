import { IInputController } from "../ports/IInputController";
import { Paddle } from "../objects/Paddle";

abstract class BaseController implements IInputController {
    protected id: string;
    protected paddle: Paddle | null = null;

    constructor(id: string) {
        this.id = id;
    }

    public getId(): string {
        return this.id;
    }

    public connectToPaddle(paddle: Paddle): void {
        this.paddle = paddle;
    }

    public disconnectPaddle(): void {
        this.paddle = null;
    }

    // Adicionar métodos ausentes para implementar completamente a interface IInputController
    public initialize(): void {
        // Lógica de inicialização, se necessário
    }

    public dispose(): void {
        this.disconnectPaddle();
    }

    public getPaddle(): Paddle | null {
        return this.paddle;
    }

    public abstract update(deltaTime: number): void;
}

export { BaseController };

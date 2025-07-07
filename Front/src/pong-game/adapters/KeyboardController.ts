import { Scene } from "@babylonjs/core";
import { IInputController } from "../ports/IInputController";
import { BaseController } from "./BaseController";
import { Paddle } from "../objects/Paddle";

/**
 * Controlador de paddle baseado em teclado
 */
export class KeyboardController extends BaseController {
    private scene: Scene;
    private upKey: string;
    private downKey: string;
    private keyStatus: { [key: string]: boolean } = {};
    private initialized: boolean = false;
    private moveSpeed: number;
    private paddleSize: { width: number; height: number; depth: number };
    private tableWidth: number;
    private tableDepth: number;

    private _onKeyDown: ((evt: KeyboardEvent) => void) | null = null;
    private _onKeyUp: ((evt: KeyboardEvent) => void) | null = null;

    /**
     * Cria um novo controlador de teclado
     * @param id Identificador único do controlador
     * @param scene A cena Babylon.js
     * @param upKey Tecla para mover para cima
     * @param downKey Tecla para mover para baixo
     * @param moveSpeed Velocidade de movimento (opcional)
     */
    constructor(
        id: string,
        scene: Scene,
        upKey: string,
        downKey: string,
        moveSpeed: number = 0.5,
        tableWidth: number = 100,
        tableDepth: number = 80) {
        super(id);
        this.id = id;
        this.scene = scene;
        this.upKey = upKey;
        this.downKey = downKey;
        this.moveSpeed = moveSpeed;
        this.tableWidth = tableWidth;
        this.tableDepth = tableDepth;
    }

  
    /**
     * Retorna o paddle conectado
     */
    public getPaddle(): Paddle | null {
        return this.paddle;
    }

    /**
     * Conecta o controlador a um paddle
     */
    public connectToPaddle(paddle: Paddle): void {
        this.paddle = paddle;
        this.paddleSize = paddle.getPaddleSize();
    }

    /**
     * Desconecta o paddle atual
     */
    public disconnectPaddle(): void {
        this.paddle = null;
    }

    /**
     * Inicializa os event listeners do teclado
     */
    public initialize(): void {
        if (this.initialized) return;

        // Configura os event listeners do teclado
        const handleKeyDown = (evt: KeyboardEvent) => {
            if (evt.key === this.upKey || evt.key === this.downKey) {
                this.keyStatus[evt.key] = true;
            }
        };

        const handleKeyUp = (evt: KeyboardEvent) => {
            if (evt.key === this.upKey || evt.key === this.downKey) {
                this.keyStatus[evt.key] = false;
            }
        };

        // Adiciona os event listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Guarda referências aos callbacks para poder removê-los depois
        this._onKeyDown = handleKeyDown;
        this._onKeyUp = handleKeyUp;

        this.initialized = true;
    }    /**
     * Atualiza o paddle baseado no estado das teclas
     */
    public update(deltaTime: number): void {
        if (!this.initialized || !this.paddle) return;

        let direction = 0;

        // Verifica qual tecla está sendo pressionada
        if (this.keyStatus[this.upKey]) {
            direction -= 1; // Mover para cima
        }

        if (this.keyStatus[this.downKey]) {
            direction += 1; // Mover para baixo
        }

        if (direction !== 0) {
            const moveLimit = (this.tableDepth / 2) - (this.paddleSize.depth - 3); // Deixa uma margem de 5 unidades


            if (direction < 0) {
                this.paddle.moveUp(moveLimit);
            } else {
                this.paddle.moveDown(moveLimit);
            }
        }
    }

    /**
     * Limpa os recursos e remove event listeners
     */
    public dispose(): void {
        if (!this.initialized) return;

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
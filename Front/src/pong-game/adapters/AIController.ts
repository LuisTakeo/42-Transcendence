import { Scene } from "@babylonjs/core";
import { IInputController } from "../ports/IInputController";
import { Paddle } from "../objects/Paddle";
import { Ball } from "../objects/Ball";
import { BaseController } from "./BaseController";

/**
 * Controlador de Inteligência Artificial para o paddle
 */
export class AIController extends BaseController {
    private scene: Scene;
    private ball: Ball | null = null;
    private reactionSpeed: number;
    private moveSpeed: number;
    private difficultyFactor: number; // 0 = fácil, 1 = difícil
    private tableWidth: number;
    private tableDepth: number;
    private paddleSize: { width: number; height: number; depth: number };
    private lastDecisionTime: number = 0; // Tempo da última decisão
    private difficultLevel: number = 0; // Contador de decisões dentro do intervalo

    /**
     * Cria um controlador de IA para paddle
     * @param id Identificador único do controlador
     * @param scene A cena Babylon.js
     * @param ball A bola que a IA deve seguir
     * @param difficulty Fator de dificuldade (0 = fácil, 1 = difícil)
     * @param moveSpeed Velocidade de movimento da IA
     * @param tableWidth Largura da mesa
     * @param tableDepth Profundidade da mesa
     */
    constructor(
        id: string,
        scene: Scene,
        ball: Ball,
        difficulty: number = 0.2,
        moveSpeed: number = 0.5,
        tableWidth: number = 100,
        tableDepth: number = 80
    ) {
        super(id);
        this.id = id;
        this.scene = scene;
        this.ball = ball;
        this.tableWidth = tableWidth;
        this.tableDepth = tableDepth;
        this.paddleSize = { width: 1, height: 4, depth: 10 }; // Tamanho padrão do paddle
        this.difficultyFactor = Math.max(0, Math.min(1, difficulty)); // Limita entre 0 e 1
        this.reactionSpeed = 1 - (0.7 * (1 - this.difficultyFactor)); // Mais lento em dificuldades mais baixas
        this.moveSpeed = moveSpeed * (0.3 + (0.7 * this.difficultyFactor)); // Mais lento em dificuldades mais baixas

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
     * Conecta o controlador a um paddle
     */
    public connectToPaddle(paddle: Paddle): void {
        this.paddle = paddle;
        this.paddleSize = paddle.getPaddleSize(); // Obtém o tamanho do paddle
    }

    /**
     * Desconecta o paddle atual
     */
    public disconnectPaddle(): void {
        this.paddle = null;
    }

    /**
     * Inicializa o controlador de IA
     */
    public initialize(): void {
        // Não há necessidade de inicialização específica para a IA
        // Ela funciona continuamente a partir da atualização de frames
    }

    /**
     * Atualiza a posição do paddle baseada na posição da bola
     * @param deltaTime Tempo desde o último frame
     */
    public update(deltaTime: number): void {
        if (!this.paddle || !this.ball) return;

        const currentTime = Date.now();


        if (currentTime - this.lastDecisionTime >= 1000) {
            this.lastDecisionTime = currentTime;
            this.difficultLevel = 0;
        }

        if (this.difficultLevel >= 20) {
            return;
        }

        this.difficultLevel++;

        const ballPosition = this.ball.getMesh().position;
        const paddlePosition = this.paddle.getMesh().position;

        if (Math.random() > this.reactionSpeed) {
            return;
        }

        // Adiciona algum erro aleatório com base na dificuldade
        const errorFactor = (1 - this.difficultyFactor) * 10;
        const randomError = (Math.random() - 0.5) * errorFactor;

        const targetZ = ballPosition.z + randomError;

        const difference = targetZ - paddlePosition.z;
        const moveLimit = (this.tableDepth / 2) - (this.paddleSize.depth - 3);
        const moveAmount = difference * this.moveSpeed * deltaTime * 60;

        if (moveAmount > 0) {
            this.paddle.moveUp(moveLimit);
        } else if (moveAmount < 0) {
            this.paddle.moveDown(moveLimit);
        }
    }

    /**
     * Limpa os recursos
     */
    public dispose(): void {
        this.paddle = null;
    }

    /**
     * Atualiza a dificuldade da IA
     * @param difficulty Novo fator de dificuldade (0 = fácil, 1 = difícil)
     */
    public setDifficulty(difficulty: number): void {
        this.difficultyFactor = Math.max(0, Math.min(1, difficulty));

        // Recalcula reactionSpeed e moveSpeed com base na nova dificuldade
        this.reactionSpeed = 1 - (0.7 * (1 - this.difficultyFactor));
        this.moveSpeed = 0.5 * (0.3 + (0.7 * this.difficultyFactor));

        console.log(`Dificuldade atualizada: ${this.difficultyFactor}`);
        console.log(`Velocidade de reação: ${this.reactionSpeed}, Velocidade de movimento: ${this.moveSpeed}`);
    }

    // ✅ Método para atualizar tamanho da mesa se necessário
    public updateTableSize(tableWidth: number, tableDepth: number): void {
        this.tableWidth = tableWidth;
        this.tableDepth = tableDepth;
    }
}
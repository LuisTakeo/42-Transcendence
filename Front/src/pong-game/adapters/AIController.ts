import { Scene } from "@babylonjs/core";
import { IInputController } from "../ports/IInputController";
import { Paddle } from "../objects/Paddle";
import { Ball } from "../objects/Ball";

/**
 * Controlador de Inteligência Artificial para o paddle
 */
export class AIController implements IInputController {
    private id: string;
    private scene: Scene;
    private paddle: Paddle | null = null;
    private ball: Ball | null = null;
    private reactionSpeed: number;
    private moveSpeed: number;
    private difficultyFactor: number; // 0 = fácil, 1 = difícil

    /**
     * Cria um controlador de IA para paddle
     * @param id Identificador único do controlador
     * @param scene A cena Babylon.js
     * @param ball A bola que a IA deve seguir
     * @param difficulty Fator de dificuldade (0 = fácil, 1 = difícil)
     * @param moveSpeed Velocidade de movimento da IA
     */
    constructor(
        id: string,
        scene: Scene,
        ball: Ball,
        difficulty: number = 2,
        moveSpeed: number = 0.5
    ) {
        this.id = id;
        this.scene = scene;
        this.ball = ball;
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

        // Obtém as posições
        const ballPosition = this.ball.getMesh().position;
        const paddlePosition = this.paddle.getMesh().position;

        // Introduz um atraso com base na dificuldade
        // Quanto menor a dificuldade, mais a IA "olha" para uma bola no passado
        const paddleWidth = this.paddle.getMesh().getBoundingInfo().boundingBox.extendSize.x * 2;

        // Decide se o paddle se move
        if (Math.random() > this.reactionSpeed) {
            // Ocasionalmente não faz nada - simula tempo de reação humana
            return;
        }

        // Adiciona algum erro aleatório com base na dificuldade
        const errorFactor = (1 - this.difficultyFactor) * 10;
        const randomError = (Math.random() - 0.5) * errorFactor;

        const targetZ = ballPosition.z + randomError;

        // Calcula e aplica o movimento
        const difference = targetZ - paddlePosition.z;
        const moveLimit = 35; // Ajustar conforme a mesa

        // Aplica movimento suavizado pela dificuldade
        const moveAmount = difference * this.moveSpeed * deltaTime * 60; // Normaliza com base em 60 FPS

        if (moveAmount > 0) {
            this.paddle.moveUp(Math.min(moveAmount, moveLimit));
        } else if (moveAmount < 0) {
            this.paddle.moveDown(Math.min(-moveAmount, moveLimit));
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
        this.reactionSpeed = 1 - (0.7 * (1 - this.difficultyFactor));
        this.moveSpeed = 0.5 * (0.3 + (0.7 * this.difficultyFactor));
    }
}
import { Scene, Vector3 } from "@babylonjs/core";
import { IInputController } from "../ports/IInputController";
import { Paddle } from "../objects/Paddle";
import { Ball } from "../objects/Ball";
import { BaseController } from "./BaseController";
import { LevelAI } from "../game";

/**
 * Controlador de Inteligência Artificial para o paddle
 */
export class AIController extends BaseController {
    private scene: Scene;
    private ball: Ball | null = null;
    private reactionSpeed: number;
    private moveSpeed: number;
    private difficultyFactor: number; // 0 = fácil, 1 = difícil
    private tableDepth: number;
    private paddleSize: { width: number; height: number; depth: number };
    private lastDecisionTime: number = 0; // Tempo da última decisão
    private difficultLevel: number = 0; // Contador de decisões dentro do intervalo
    private decisions: number = 0; // Contador de decisões
    private lastBallPosition: Vector3 | null = null; // Última posição capturada da bolinha
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
        tableDepth: number = 80,
        difficultLevel: LevelAI = LevelAI.EASY
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
        this.difficultLevel = difficultLevel; // Define o nível de dificuldade da IA
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
     */
    public update(): void {
        if (!this.paddle || !this.ball) return;

        const currentTime = Date.now();

        if (currentTime - this.lastDecisionTime >= 1000) {
            this.lastDecisionTime = currentTime;

            // Capturar a posição atual da bolinha
            this.lastBallPosition = this.ball.getMesh().position.clone();
            this.decisions = 0; // Reseta o contador de decisões
        }

        if (!this.lastBallPosition) return;
        if (this.decisions >= this.difficultLevel) return;
        
        this.decisions++;
        const paddlePosition = this.paddle.getMesh().position;

        // Decidir movimento com base na última posição capturada
        const targetZ = this.lastBallPosition.z;
        
        if (Math.abs(targetZ - paddlePosition.z) < 0.5) 
            return;
        
        const difference = targetZ - paddlePosition.z;
        const border = (this.tableDepth / 2) - (this.paddleSize.depth - 2.5);
        

        if (difference > 0) {
            this.paddle.moveUp(border);
        } else if (difference < 0) {
            this.paddle.moveDown(border);
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

    public predictBallPosition(): Vector3 | null {
        if (!this.ball) return null;

        const currentPosition = this.ball.getMesh().position;
        const velocity = this.ball.getVelocity(); // Usar método público getVelocity

        // Simular bounces na mesa
        let futurePosition = currentPosition.add(velocity.scale(1));
        if (futurePosition.z > this.tableDepth / 2 || futurePosition.z < -this.tableDepth / 2) {
            velocity.z *= -1; // Inverter direção no eixo Z
            futurePosition = currentPosition.add(velocity.scale(1));
        }

        return futurePosition;
    }
}
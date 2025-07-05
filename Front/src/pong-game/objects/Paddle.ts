import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";

/**
 * Tipo que define os lados possíveis do jogador
 */
export type PaddleSide = 'left' | 'right';

/**
 * Classe que representa um paddle (raquete) do jogo de Pong
 */
class Paddle {
    private scene: Scene;
    private mesh: Mesh;
    private side: PaddleSide;
    private speed: number = 0.5;
    private paddleSize: { width: number; height: number; depth: number };

    /**
     * Construtor do paddle
     * @param scene Cena Babylon.js
     * @param side Lado do jogador (esquerdo ou direito)
     * @param tableWidth Largura da mesa para posicionamento
     * @param tableDepth Profundidade da mesa para limites de movimento
     */
    constructor(scene: Scene, side: PaddleSide, tableWidth: number, tableDepth: number) {
        this.scene = scene;
        this.side = side;
        this.paddleSize = { width: 2, height: 4, depth: 10 };
        const xPos = side === 'left' ? -(tableWidth / 2) + 3 : (tableWidth / 2) - 3;
        this.createPaddle(new Vector3(xPos, 11, 0), tableDepth);
    }

    /**
     * Cria a malha do paddle
     * @param position Posição inicial
     * @param tableDepth Profundidade da mesa para dimensionamento
     */
    private createPaddle(position: Vector3, tableDepth: number): void {
        // Criar um paddle retangular
        this.mesh = MeshBuilder.CreateBox("paddle_" + this.side, this.paddleSize, this.scene);

        this.mesh.position = position;

        const material = new StandardMaterial("paddleMaterial", this.scene);
        material.diffuseColor = this.side === 'left' ?
            new Color3(1, 0.2, 0.2) :  // Vermelho para o jogador da esquerda
            new Color3(0.2, 0.2, 1);   // Azul para o jogador da direita
        material.specularColor = new Color3(0.3, 0.3, 0.3);
        this.mesh.material = material;
    }

    /**
     * Move o paddle para cima (em direção a Z positivo)
     * @param limit Limite máximo de movimento
     */
    public moveUp(limit: number): void {
        if (this.mesh.position.z < limit) {
            this.mesh.position.z += this.speed;
        }
    }

    /**
     * Move o paddle para baixo (em direção a Z negativo)
     * @param limit Limite máximo de movimento
     */
    public moveDown(limit: number): void {
        if (this.mesh.position.z > -limit) {
            this.mesh.position.z -= this.speed;
        }
    }

    /**
     * Obtém a malha do paddle
     */
    public getMesh(): Mesh {
        return this.mesh;
    }

    public getPaddleSize(): {width: number; height: number; depth: number} {
        return this.paddleSize;
    }

    /**
     * Define a velocidade de movimento do paddle
     */
    public setSpeed(speed: number): void {
        this.speed = speed;
    }
}

export { Paddle };
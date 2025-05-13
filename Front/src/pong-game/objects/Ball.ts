import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";

/**
 * Classe que representa a bola do jogo de Pong
 */
class Ball {
    private scene: Scene;
    private mesh: Mesh;
    private velocity: Vector3;
    private speed: number = 0.5;

    /**
     * Construtor da bola
     * @param scene Cena Babylon.js
     * @param position Posição inicial da bola
     */
    constructor(scene: Scene, position: Vector3) {
        this.scene = scene;
        this.velocity = new Vector3(this.speed, 0, this.speed);
        this.createBall(position);
    }

    /**
     * Cria a malha da bola
     * @param position Posição inicial
     */
    private createBall(position: Vector3): void {
        this.mesh = MeshBuilder.CreateSphere("ball", {
            diameter: 1.5
        }, this.scene);

        this.mesh.position = position;

        const material = new StandardMaterial("ballMaterial", this.scene);
        material.diffuseColor = new Color3(1, 1, 1);
        material.specularColor = new Color3(0.3, 0.3, 0.3);
        this.mesh.material = material;
    }

    /**
     * Atualiza a posição da bola com base em sua velocidade
     */
    public update(): void {
        this.mesh.position.addInPlace(this.velocity);

        // Exemplo simples de detecção de colisão com os limites da mesa
        // Estes valores precisarão ser ajustados com base no tamanho real da mesa
        if (this.mesh.position.x > 24 || this.mesh.position.x < -24) {
            this.velocity.x *= -1;
        }

        if (this.mesh.position.z > 24 || this.mesh.position.z < -24) {
            this.velocity.z *= -1;
        }
    }

    /**
     * Obtém a malha da bola
     */
    public getMesh(): Mesh {
        return this.mesh;
    }

    /**
     * Define a velocidade da bola
     */
    public setVelocity(velocity: Vector3): void {
        this.velocity = velocity;
    }

    /**
     * Obtém a velocidade atual da bola
     */
    public getVelocity(): Vector3 {
        return this.velocity;
    }
}

export { Ball };
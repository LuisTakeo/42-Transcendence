import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";

/**
 * Classe que representa a bola do jogo de Pong
 */
class Ball {
    private scene: Scene;
    private mesh: Mesh;
    private velocity: Vector3;
    private speed: number;
    private initialSpeed: number;
    private initialPosition: Vector3;

    /**
     * Construtor da bola
     * @param scene Cena Babylon.js
     * @param position Posição inicial da bola
     */
    constructor(scene: Scene, position: Vector3, speed: number = 0.65) {
        this.speed = speed;
        this.initialSpeed = speed;
        this.scene = scene;
        this.velocity = new Vector3(this.speed, 0, this.speed);
        this.initialPosition = position.clone();
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

        material.specularPower = 64;
        this.mesh.material = material;

        this.mesh.checkCollisions = true;
        this.mesh.receiveShadows = false;
    }

    /**
     * Atualiza a posição da bola com base em sua velocidade
     */
    public update(tableWidth: number, tableDepth: number): void {
        this.mesh.position.addInPlace(this.velocity);
        const halfTableWidth = (tableWidth / 2);
        const halfTableDepth = (tableDepth / 2) - 3;
        // Exemplo simples de detecção de colisão com os limites da mesa
        // Estes valores precisarão ser ajustados com base no tamanho real da mesa
        if (this.mesh.position.x > halfTableWidth || this.mesh.position.x < -(halfTableWidth)) {
            // TODO: Adicionar lógica de pontuação e bolinha caindo
            this.mesh.position = this.initialPosition.clone(); // Reseta a posição da bola
            this.velocity = new Vector3(this.initialSpeed, 0, this.initialSpeed); // Reseta a velocidade
            this.initialSpeed *= -1; // Inverte a direção da velocidade
        }

        if (this.mesh.position.z > halfTableDepth || this.mesh.position.z < -(halfTableDepth)) {
            this.velocity.z *= -1;
        }

        console.log(`Bola atualizada: posição = ${this.mesh.position}, velocidade = ${this.velocity}`); // Log para depuração
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

    public dispose(): void {
        if (this.mesh) {
            this.mesh.dispose();
        }
        this.scene = null as any; // Limpa a referência à cena
        this.mesh = null as any; // Limpa a referência à malha
        this.velocity = null as any; // Limpa a referência à velocidade
        this.initialPosition = null as any; // Limpa a referência à posição inicial
        this.initialSpeed = 0; // Reseta a velocidade inicial
    }

    // funções para remoto:

    public updatePosition(position: Vector3): void {
        this.mesh.position = position;
    }

}

export { Ball };
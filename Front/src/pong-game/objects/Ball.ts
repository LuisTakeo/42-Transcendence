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
    private tableSize: { width: number; depth: number };
    private halfTable: { width: number; depth: number };
    private diameter: number = 2; // Diâmetro da bola

    /**
     * Construtor da bola
     * @param scene Cena Babylon.js
     * @param position Posição inicial da bola
     */
    constructor(scene: Scene, 
                position: Vector3, speed: number = 0.65, 
                tableSize: { width: number; depth: number } = { width: 100, depth: 80 }) 
    {
        this.speed = speed; 
        this.initialSpeed = speed;
        this.scene = scene;
        this.velocity = new Vector3(this.speed, 0, this.speed);
        this.initialPosition = position.clone();
        this.tableSize = tableSize;
        this.halfTable = {
            width: tableSize.width / 2,
            depth: (tableSize.depth / 2) - 3 // Ajuste para evitar que a bola saia muito cedo
        };
        this.createBall(position);
    }

    /**
     * Cria a malha da bola
     * @param position Posição inicial
     */
    private createBall(position: Vector3): void {
        this.mesh = MeshBuilder.CreateSphere("ball", {
            diameter: 2
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
    public update(): void {
        this.mesh.position.addInPlace(this.velocity);
        // A colisão agora é tratada pelo MainGame
    }

    /**
     * Verifica colisões e retorna o lado que a bola saiu, se aplicável
     */
    public checkCollision(): "left" | "right" | null {


        if (this.mesh.position.x > this.halfTable.width) {
            return "right"; // Bola saiu pelo lado direito
        }

        if (this.mesh.position.x < -this.halfTable.width) {
            return "left"; // Bola saiu pelo lado esquerdo
        }

        if (this.mesh.position.z > this.halfTable.depth 
            || this.mesh.position.z < -this.halfTable.depth) {
            this.velocity.z *= -1; // Inverter direção no eixo Z
        }

        return null; // Nenhuma saída detectada
    }

    public resetPosition(): void {
        this.mesh.position = this.initialPosition.clone(); // Reseta a posição da bola
        this.velocity = new Vector3(this.initialSpeed, 0, this.initialSpeed); // Reseta a velocidade
        this.initialSpeed *= -1; // Inverte a direção da velocidade
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

    public updatePositionRemote(positionX: number, positionZ: number): void {
        this.mesh.position.x = positionX;
        this.mesh.position.z = positionZ;
    }

    public getDiameter(): number {
        return this.diameter; // Retorna o diâmetro da bola
    }   

}

export { Ball };
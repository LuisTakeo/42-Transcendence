import { Color3, Color4, Mesh, MeshBuilder, Scene, StandardMaterial } from "@babylonjs/core";

/**
 * Gerencia o ambiente da cena (chão, skybox, etc.)
 */
class EnvironmentManager {
    private scene: Scene;
    private ground: Mesh;
    private surroundingGround: Mesh;

    /**
     * Construtor do gerenciador de ambiente
     * @param scene Cena Babylon.js
     */
    constructor(scene: Scene) {
        this.scene = scene;

        // Define a cor de fundo da cena
        this.scene.clearColor = new Color4(0, 0.7, 1, 1);
    }

    /**
     * Cria o chão da cena
     */
    public createGround(): void {
        // Cria um chão principal
        this.ground = MeshBuilder.CreateGround('ground1', { width: 300, height: 200 }, this.scene);
        const groundMaterial = new StandardMaterial('groundMat', this.scene);
        groundMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
        this.ground.material = groundMaterial;
        this.ground.position.z = 0;
        this.ground.position.y = 0;
        this.ground.receiveShadows = true;

        // Cria um chão secundário mais amplo
        this.surroundingGround = MeshBuilder.CreateGround('ground2', { width: 1000, height: 1000 }, this.scene);
        const surroundingMaterial = new StandardMaterial('groundMat2', this.scene);
        surroundingMaterial.diffuseColor = new Color3(0.9, 0.9, 0.9);
        surroundingMaterial.specularColor = new Color3(0.9, 0.9, 0.9);
        this.surroundingGround.material = surroundingMaterial;
        this.surroundingGround.position.z = 0;
        this.surroundingGround.position.y = -0.1;
        this.surroundingGround.receiveShadows = true;
    }

    public getGround(): Mesh {
        return this.ground;
    }

}

export { EnvironmentManager };
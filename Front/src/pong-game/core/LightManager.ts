import { DirectionalLight, HemisphericLight, Scene, Vector3 } from "@babylonjs/core";

/**
 * Gerencia a criação e configuração das luzes na cena
 */
class LightManager {
    private scene: Scene;
    private hemisphericLight: HemisphericLight;
    private directionalLight: DirectionalLight;

    /**
     * Construtor do gerenciador de luzes
     * @param scene Cena Babylon.js
     */
    constructor(scene: Scene) {
        this.scene = scene;
    }

    /**
     * Cria as luzes básicas para a cena
     */
    public createLights(): void {
        // Cria uma luz hemisférica
        this.hemisphericLight = new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);
        this.hemisphericLight.intensity = 0.7;

        // Adiciona uma luz direcional para melhorar as sombras
        this.directionalLight = new DirectionalLight('dirLight', new Vector3(-0.5, -1, -0.5), this.scene);
        this.directionalLight.intensity = 0.5;
    }

    /**
     * Obtém a luz hemisférica
     */
    public getHemisphericLight(): HemisphericLight {
        return this.hemisphericLight;
    }

    /**
     * Obtém a luz direcional
     */
    public getDirectionalLight(): DirectionalLight {
        return this.directionalLight;
    }
}

export { LightManager };
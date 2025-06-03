import { DirectionalLight, HemisphericLight, Scene, ShadowGenerator, Vector3 } from "@babylonjs/core";

/**
 * Gerencia a criação e configuração das luzes na cena
 */
class LightManager {
    private scene: Scene;
    private hemisphericLight: HemisphericLight;
    private directionalLight: DirectionalLight;
    private shadowGenerator: ShadowGenerator;
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

        // Ajuste na luz direcional para garantir sombras apenas para baixo
        // Direção apontando diretamente para baixo com leve inclinação
        this.directionalLight = new DirectionalLight('dirLight', new Vector3(0.1, -1, 0.1), this.scene);
        this.directionalLight.intensity = 0.5;

        // Posicionar a luz bem acima da cena
        this.directionalLight.position = new Vector3(0, 100, 0);

        // Configurações de sombra
        this.shadowGenerator = new ShadowGenerator(1024, this.directionalLight);
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.useKernelBlur = true;
        this.shadowGenerator.blurKernel = 3;

        // Adicionar estas configurações para melhorar a qualidade das sombras
        this.shadowGenerator.bias = 0.00001;
        this.shadowGenerator.normalBias = 0.01;
        this.shadowGenerator.darkness = 0.6;
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

    public getShadowGenerator(): ShadowGenerator {
        return this.shadowGenerator;
    }
}

export { LightManager };
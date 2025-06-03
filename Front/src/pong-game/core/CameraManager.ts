import { FreeCamera, Scene, Vector3 } from "@babylonjs/core";

/**
 * Gerencia a criação e controle da câmera
 */
class CameraManager {
    private scene: Scene;
    private canvas: HTMLCanvasElement;
    private camera: FreeCamera;

    /**
     * Construtor do gerenciador de câmera
     * @param scene Cena Babylon.js
     * @param canvas Elemento canvas para controle da câmera
     */
    constructor(scene: Scene, canvas: HTMLCanvasElement) {
        this.scene = scene;
        this.canvas = canvas;
    }

    /**
     * Cria uma câmera livre na posição especificada
     * @param position Posição inicial da câmera
     * @returns A câmera criada
     */
    public createCamera(position: Vector3): FreeCamera {
        this.camera = new FreeCamera('camera1', position, this.scene);
        this.camera.setTarget(Vector3.Zero());
        // this.camera.attachControl(this.canvas, false);
        return this.camera;
    }

    /**
     * Obtém a câmera atual
     */
    public getCamera(): FreeCamera {
        return this.camera;
    }
}

export { CameraManager };
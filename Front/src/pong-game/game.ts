import {
    Engine,
    Scene,
    FreeCamera,
    Vector3,
    HemisphericLight,
    DirectionalLight,
    MeshBuilder,
    StandardMaterial,
    Color3,
    Color4,
    Animation,
    Mesh,
    Texture } from "@babylonjs/core";

/**
 * Classe principal para gerenciar a aplicação Babylon.js
 */
class MainGame {
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    private scene: Scene;
    private table: Mesh;

    private objects: Mesh[] = []; // Array para armazenar os objetos da cena

    /**
     * Construtor da classe principal
     * @param canvasId ID do elemento canvas no HTML
     */
    constructor(canvasId: string) {
        // Obtém a referência do canvas
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.canvas) throw new Error(`Canvas com ID "${canvasId}" não encontrado`);

        // Inicializa a engine do Babylon
        this.engine = new Engine(this.canvas, true);

        // Cria uma cena
        this.scene = new Scene(this.engine);
    }

    private initCamera(vector: Vector3): void {
        // Cria uma câmera livre posicionada acima do chão
      const camera = new FreeCamera('camera1', vector, this.scene);
      camera.setTarget(Vector3.Zero());
      camera.attachControl(this.canvas, true);
    }

    private initLights(): void {
        // Cria uma luz hemisférica
        const light = new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;

        // Adiciona uma luz direcional para melhorar as sombras
        const dirLight = new DirectionalLight('dirLight', new Vector3(-0.5, -1, -0.5), this.scene);
        dirLight.intensity = 0.5;
    }
    /**
     * Inicializa a cena com elementos básicos
     */

    private initGround(): void {
        // Cria um chão plano
        const ground = MeshBuilder.CreateGround('ground1', { width: 120, height: 100 }, this.scene);
        const groundMaterial = new StandardMaterial('groundMat', this.scene);
        groundMaterial.diffuseColor = new Color3(0, 0.5, 0.5); // Cor cinza
        ground.material = groundMaterial;
        ground.position.z = 0; // Posição Z do chão
        ground.position.y = 0; // Posição Y do chão
        ground.receiveShadows = true; // Permite que o chão receba sombras


        const ground2 = MeshBuilder.CreateGround('ground2', { width: 200, height: 150 }, this.scene);
        const groundMaterial2 = new StandardMaterial('groundMat2', this.scene);
        groundMaterial2.diffuseColor = new Color3(0, 0.5, 0); // Cor cinza
        groundMaterial2.specularColor = new Color3(0, 0.5, 0); // Cor cinza
        ground2.material = groundMaterial2;
        ground2.position.z = 0; // Posição Z do chão
        ground2.position.y = -0.1; // Posição Y do chão
        ground2.receiveShadows = true; // Permite que o chão receba sombras
    }

    private createTable(): void {
    // Cria o tampo da mesa
        this.table = MeshBuilder.CreateBox('tableTop', {
            width: 50, // Largura do tampo
            height: 1,  // Espessura do tampo
            depth: 50 // Comprimento do tampo
        }, this.scene);
        this.table.position.y = 10;  // Posição Y do tampo
        this.table.position.z = 0; // Posição Z do tampo
        console.log(this.table.position.x)
        // Material para o tampo da mesa
        const tableTopMaterial = new StandardMaterial('tableTopMat', this.scene);
        tableTopMaterial.diffuseColor = new Color3(0.3, 0, 0.8);  // Roxo
        tableTopMaterial.specularColor = new Color3(0, 0.4, 0.8);
        this.table.material = tableTopMaterial;

        // Cria as pernas da mesa
        const legRadius = 0.5;
        const legHeight = 10;

        console.log(this.table.absolutePosition.x)
        // Define as posições das pernas (nas quatro extremidades)




        const boundingInfo = this.table.getBoundingInfo();
        const size = boundingInfo.boundingBox.extendSize.scale(2); // extendSize é metade do tamanho
        console.log(`Width: ${size.x}, Height: ${size.y}, Depth: ${size.z}`);
        const xHalfWithBorder = (size.x / 2) - (legRadius + 4); // Largura da mesa + raio da perna
        const zHalfWithBorder = (size.z / 2) - (legRadius + 4); // Profundidade da mesa + raio da perna
        const legXPositions = [
            this.table.position.x - xHalfWithBorder, // Perna esquerda
            this.table.position.x + xHalfWithBorder, // Perna direita
        ]
        const legZPositions = [
            this.table.position.z - zHalfWithBorder, // Perna frente
            this.table.position.z + zHalfWithBorder, // Perna trás
        ];

        const legPositions = [
            new Vector3(legXPositions[1], legHeight/2, legZPositions[0]),
            new Vector3(legXPositions[0], legHeight/2, legZPositions[0]),
            new Vector3(legXPositions[1], legHeight/2, legZPositions[1]),
            new Vector3(legXPositions[0], legHeight/2, legZPositions[1]),
        ];

        // Material para as pernas
        const legMaterial = new StandardMaterial('legMat', this.scene);
        legMaterial.diffuseColor = new Color3(0.3, 0, 0.8); // Roxo
        // Cria cada perna
        legPositions.forEach((position, index) => {
            const leg = MeshBuilder.CreateCylinder(`leg${index}`, {
                height: legHeight,
                diameter: legRadius * 2
            }, this.scene);
            leg.position = position;
            leg.material = legMaterial;
        });

        // adicionar linha de centro com grossura 0.1 e altura 10
        const lineWidth = 2;
        const lineHeight = 0.01;
        const line = MeshBuilder.CreateBox("line", {
            width: lineWidth,
            height: lineHeight + 1,
            depth: (legZPositions[1] - legZPositions[0] + 2 * lineWidth) - 2,
        }, this.scene);

        line.position = new Vector3(0, this.table.position.y + .5, (legZPositions[0] + legZPositions[1]) / 2);
        // const line = MeshBuilder.CreateLines("line",
        //     {
        //         points: [
        //             new Vector3(0, this.table.position.y + 1, legZPositions[0]),
        //             new Vector3(0, this.table.position.y + 1, legZPositions[1]),
        //         ],
        //         updatable: true,
        //         instance: null,

        //     }, this.scene);
        const lineMaterial = new StandardMaterial('lineMat', this.scene);
        lineMaterial.diffuseColor = new Color3(1, 1, 1); // Vermelho
        lineMaterial.specularColor = new Color3(1, 1, 1); // Vermelho
        line.material = lineMaterial;

        // criar laterais da mesa com width da mesa e grossura 0.1 e altura 10
        const sideBarA = MeshBuilder.CreateBox("sideBarA", {
            width: size.x - 1,
            height: lineHeight  + .5,
            depth: 2,
        }, this.scene);
        sideBarA.position = new Vector3(
            this.table.position.x,
            this.table.position.y + 1,
            legZPositions[1] + 3.5);


        const sideBarMaterial = new StandardMaterial('sideBarMat', this.scene);
        sideBarMaterial.diffuseColor = new Color3(0, 0.4, 0.8);
        sideBarMaterial.specularColor = new Color3(0, 0.4, 0.8); // Azul
        sideBarA.material = sideBarMaterial;

        const sideBarB = MeshBuilder.CreateBox("sideBarB", {
            width: size.x - 1,
            height: lineHeight + .5,
            depth: 2,
        }, this.scene);
        sideBarB.position = new Vector3(
            this.table.position.x,
            this.table.position.y + 1,
            legZPositions[0] - 3.5);
        sideBarB.material = sideBarMaterial;
        // criar laterais da mesa com width da mesa e grossura 0.1 e altura 10

    }

    private initializeScene(): void {
        this.scene.clearColor = new Color4(0, 0.7, 1, 1);
        this.initCamera(new Vector3(10, 80, -100)); // Posição inicial da câmera
        this.initLights(); // Inicializa as luzes
        this.initGround(); // Inicializa o chão
        this.createTable(); // Cria a mesa
    }


    /**
     * Inicia o loop de renderização
     */
    public run(): void {
        // Inicializa a cena
        this.initializeScene();
        // Registra o loop de renderização
        this.engine.runRenderLoop(() => {
            this.update();
            this.scene.render();
        });

        // Ajusta o tamanho do canvas quando a janela for redimensionada
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    /**
     * Método de atualização chamado a cada frame
     * Aqui você pode adicionar lógica que deve ser executada em cada frame
     */
    public update(): void {
        // Aqui você pode implementar sua lógica de atualização
        // Por exemplo, animações, física, lógica de jogo, etc.

    }
}

export { MainGame };
import { Color3, Mesh, MeshBuilder, Scene, ShadowGenerator, StandardMaterial, Vector3 } from "@babylonjs/core";
import { Ball } from "./Ball";
import { Paddle } from "./Paddle";
import { BleacherSection } from "./BleacherSection";

/**
 * Gerencia a mesa de Pong e seus componentes
 */
class TableManager {
    private scene: Scene;
    private table: Mesh;
    private legs?: Mesh[] = [];
    private centerLine?: Mesh;
    private sideBarA?: Mesh;
    private sideBarB?: Mesh;

    private bleachers: BleacherSection[] = [];

    private shadowGenerator?: ShadowGenerator;

	private ball?: Ball;
	private ballSpeed: number;

	private paddleLeft?: Paddle;
	private paddleRight?: Paddle;

	private tableWidth: number;
	private tableDepth: number;


    /**
     * Construtor do gerenciador da mesa
     * @param scene Cena Babylon.js
     */
    constructor(scene: Scene, tableWidth: number = 100, tableDepth: number = 80, ballSpeed: number = 0.65) {
        this.ballSpeed = ballSpeed;
        this.scene = scene;
        this.tableWidth = tableWidth;
        this.tableDepth = tableDepth;
    }

    /**
     * Cria a mesa de Pong completa
     */
    public createTable(): void {
        this.createTableTop();
        this.createTableLegs();
        this.createCenterLine();
        this.createSideBars();
		this.createGameElements();
        this.createBleachers();

        if (this.shadowGenerator)
            this.configureShadows();
    }

    private createBleachers(): void {
        // Buscando as dimensões da mesa para posicionar as arquibancadas corretamente
        const tableHalfWidth = this.tableWidth / 2;
        const tableHalfDepth = this.tableDepth / 2;

        // Distância das arquibancadas em relação à mesa
        const distanceFromTable = 50;

        // Exemplo: Criar uma arquibancada no lado direito
        const rightBleacher = new BleacherSection(
            this.scene,
            new Vector3(tableHalfWidth + distanceFromTable, 0, 0),
            this.tableDepth, // Largura alinhada com a profundidade da mesa
            30, // Profundidade da arquibancada
            6,  // Número de fileiras
            15, // Assentos por fileira
            90  // Rotação em graus
        );

        this.bleachers.push(rightBleacher);

        // Você pode adicionar mais arquibancadas chamando novamente o construtor com posições diferentes
        // Por exemplo, para colocar nos outros lados:

        // Lado esquerdo (exemplo)
        // const leftBleacher = new BleacherSection(
        //     this.scene,
        //     new Vector3(-(tableHalfWidth + distanceFromTable), 0, 0),
        //     this.tableDepth,
        //     20,
        //     5,
        //     10,
        //     -90
        // );
        // this.bleachers.push(leftBleacher);
    }

    public setShadowGenerator(shadowGenerator: ShadowGenerator): void {
        this.shadowGenerator = shadowGenerator;
    }

    private configureShadows(): void {
        if (!this.shadowGenerator) return;

        this.shadowGenerator.addShadowCaster(this.table);
        // A bola projeta sombra
        this.shadowGenerator.addShadowCaster(this.ball.getMesh());

        // Os paddles projetam sombras
        this.shadowGenerator.addShadowCaster(this.paddleLeft.getMesh());
        this.shadowGenerator.addShadowCaster(this.paddleRight.getMesh());

        // As pernas da mesa projetam sombras
        this.legs?.forEach(leg => {
            this.shadowGenerator?.addShadowCaster(leg);
        });

        // A mesa recebe sombras
        this.table.receiveShadows = true;

        // As barras laterais projetam e recebem sombras
        if (this.sideBarA) {
            this.shadowGenerator.addShadowCaster(this.sideBarA);
            this.sideBarA.receiveShadows = true;
        }

        if (this.sideBarB) {
            this.shadowGenerator.addShadowCaster(this.sideBarB);
            this.sideBarB.receiveShadows = true;
        }


        this.bleachers.forEach(bleacher => {
            bleacher.configureShadows(this.shadowGenerator);
        });
    }

	/**
     * Cria os elementos do jogo (bola e paddles)
     */
	private createGameElements(): void {
        // Cria a bola no centro da mesa
        this.ball = new Ball(this.scene, new Vector3(0, 12, 0), this.ballSpeed);

        // Cria os paddles em cada extremidade da mesa
        this.paddleLeft = new Paddle(this.scene, 'left', this.tableWidth, this.tableDepth);
        this.paddleRight = new Paddle(this.scene, 'right', this.tableWidth, this.tableDepth);
    }

    /**
     * Cria o tampo da mesa
     */
    private createTableTop(): void {
        this.table = MeshBuilder.CreateBox('tableTop', {
            width: this.tableWidth,
            height: 1,
            depth: this.tableDepth
        }, this.scene);

        this.table.position.y = 10;
        this.table.position.z = 0;

        const tableTopMaterial = new StandardMaterial('tableTopMat', this.scene);
        tableTopMaterial.diffuseColor = new Color3(0.3, 0, 0.8);
        tableTopMaterial.specularColor = new Color3(0, 0.4, 0.8);
        this.table.material = tableTopMaterial;
    }



    /**
     * Cria as pernas da mesa
     */
    private createTableLegs(): void {
        const legRadius = 0.5;
        const legHeight = 10;

        const boundingInfo = this.table.getBoundingInfo();
        const size = boundingInfo.boundingBox.extendSize.scale(2);

        const xHalfWithBorder = (size.x / 2) - (legRadius + 4);
        const zHalfWithBorder = (size.z / 2) - (legRadius + 4);

        const legXPositions = [
            this.table.position.x - xHalfWithBorder,
            this.table.position.x + xHalfWithBorder,
        ];

        const legZPositions = [
            this.table.position.z - zHalfWithBorder,
            this.table.position.z + zHalfWithBorder,
        ];

        const legPositions = [
            new Vector3(legXPositions[1], legHeight/2, legZPositions[0]),
            new Vector3(legXPositions[0], legHeight/2, legZPositions[0]),
            new Vector3(legXPositions[1], legHeight/2, legZPositions[1]),
            new Vector3(legXPositions[0], legHeight/2, legZPositions[1]),
        ];

        const legMaterial = new StandardMaterial('legMat', this.scene);
        legMaterial.diffuseColor = new Color3(0.3, 0, 0.8);

        legPositions.forEach((position, index) => {
            const leg = MeshBuilder.CreateCylinder(`leg${index}`, {
                height: legHeight,
                diameter: legRadius * 2
            }, this.scene);
            leg.position = position;
            leg.material = legMaterial;
            this.legs.push(leg);
        });
    }

    /**
     * Cria a linha central da mesa
     */
    private createCenterLine(): void {
        const boundingInfo = this.table.getBoundingInfo();
        const size = boundingInfo.boundingBox.extendSize.scale(2);

        const xHalfWithBorder = (size.x / 2) - 4.5;
        const zHalfWithBorder = (size.z / 2) - 4.5;

        const lineWidth = 2;
        const lineHeight = 0.01;

        this.centerLine = MeshBuilder.CreateBox("line", {
            width: lineWidth,
            height: lineHeight + 1,
            depth: (zHalfWithBorder * 2 + 2 * lineWidth) - 2,
        }, this.scene);

        this.centerLine.position = new Vector3(
            0,
            this.table.position.y + .5,
            this.table.position.z
        );

        const lineMaterial = new StandardMaterial('lineMat', this.scene);
        lineMaterial.diffuseColor = new Color3(1, 1, 1);
        lineMaterial.specularColor = new Color3(1, 1, 1);
        this.centerLine.material = lineMaterial;
    }

    /**
     * Cria as laterais (barras) da mesa
     */
    private createSideBars(): void {
        const boundingInfo = this.table.getBoundingInfo();
        const size = boundingInfo.boundingBox.extendSize.scale(2);
        const xHalfWithBorder = (size.x / 2) - 4.5;
        const zHalfWithBorder = (size.z / 2) - 4.5;

        const lineHeight = 0.01;

        // Barra lateral A
        this.sideBarA = MeshBuilder.CreateBox("sideBarA", {
            width: size.x - 1,
            height: lineHeight + .5,
            depth: 2,
        }, this.scene);

        this.sideBarA.position = new Vector3(
            this.table.position.x,
            this.table.position.y + 1,
            this.table.position.z + zHalfWithBorder + 3.5
        );

        const sideBarMaterial = new StandardMaterial('sideBarMat', this.scene);
        sideBarMaterial.diffuseColor = new Color3(0, 0.4, 0.8);
        sideBarMaterial.specularColor = new Color3(0, 0.4, 0.8);
        this.sideBarA.material = sideBarMaterial;

        // Barra lateral B
        this.sideBarB = MeshBuilder.CreateBox("sideBarB", {
            width: size.x - 1,
            height: lineHeight + .5,
            depth: 2,
        }, this.scene);

        this.sideBarB.position = new Vector3(
            this.table.position.x,
            this.table.position.y + 1,
            this.table.position.z - zHalfWithBorder - 3.5
        );

        this.sideBarB.material = sideBarMaterial;
    }

    /**
     * Atualiza os componentes da mesa (chamado a cada frame)
     */
    public update(): void {
		// Atualiza a posição da bola
        console.log("Ball " + this.ball?.getMesh().position);
        console.log("Table " + this.table.position);
        if (this.ball) {
            this.ball.update(this.tableWidth, this.tableDepth);

            // Você pode adicionar detecção de colisão com os paddles aqui
            this.checkBallPaddleCollision();
        }

        // Você pode adicionar controles para os paddles aqui
        this.updatePaddleControls();
	}

	private checkBallPaddleCollision(): void {
        const ballMesh = this.ball.getMesh();
        const paddleLeftMesh = this.paddleLeft.getMesh();
        const paddleRightMesh = this.paddleRight.getMesh();

        // Verifica se a bola colidiu com o paddle esquerdo
        if (ballMesh.intersectsMesh(paddleLeftMesh, false)) {
            const velocity = this.ball.getVelocity();
            if (velocity.x < 0) { // Só inverte se estiver indo para a esquerda
                velocity.x *= -1;
                this.ball.setVelocity(velocity);
            }
        }

        // Verifica se a bola colidiu com o paddle direito
        if (ballMesh.intersectsMesh(paddleRightMesh, false)) {
            const velocity = this.ball.getVelocity();
            if (velocity.x > 0) { // Só inverte se estiver indo para a direita
                velocity.x *= -1;
                this.ball.setVelocity(velocity);
            }
        }
    }

	/**
     * Atualiza os controles dos paddles
     */
    private updatePaddleControls(): void {
        // Esta é uma implementação básica para testes
        // Você pode substituir por controles reais baseados em inputs do usuário

        // Define o limite de movimento com base na mesa
        const moveLimit = (this.tableDepth / 2) - 5;

        // Exemplo de movimentação automatizada do paddle esquerdo (IA simples)
        const ballPosition = this.ball.getMesh().position;
        if (ballPosition.z > this.paddleLeft.getMesh().position.z + 2) {
            this.paddleLeft.moveUp(moveLimit);
        } else if (ballPosition.z < this.paddleLeft.getMesh().position.z - 2) {
            this.paddleLeft.moveDown(moveLimit);
        }

        // Para o paddle direito, você pode implementar controles do jogador
        // Aqui seria onde você conectaria inputs do teclado, por exemplo
    }

    /**
     * Obtém a referência para o paddle esquerdo
     */
    public getPaddleLeft(): Paddle {
        return this.paddleLeft;
    }

    /**
     * Obtém a referência para o paddle direito
     */
    public getPaddleRight(): Paddle {
        return this.paddleRight;
    }

    /**
     * Obtém a referência para a bola
     */
    public getBall(): Ball {
        return this.ball;
    }
}

export { TableManager };
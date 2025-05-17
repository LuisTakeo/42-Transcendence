import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";
import { Ball } from "./Ball";
import { Paddle } from "./Paddle";

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

	private ball?: Ball;
	private ballSpeed: number = 0.5;

	private paddleLeft?: Paddle;
	private paddleRight?: Paddle;

	private tableWidth: number = 100;
	private tableDepth: number = 80;


    /**
     * Construtor do gerenciador da mesa
     * @param scene Cena Babylon.js
     */
    constructor(scene: Scene) {
        this.scene = scene;
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
    }

	/**
     * Cria os elementos do jogo (bola e paddles)
     */
	private createGameElements(): void {
        // Cria a bola no centro da mesa
        this.ball = new Ball(this.scene, new Vector3(0, 12, 0));

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
        if (this.ball) {
            this.ball.update();

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
        const moveLimit = (this.tableDepth / 2) - 7;

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
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

    private colorPrimary: Color3;
    private colorSecondary: Color3;


    /**
     * Construtor do gerenciador da mesa
     * @param scene Cena Babylon.js
     */
    constructor(scene: Scene, tableWidth: number = 100, tableDepth: number = 80, ballSpeed: number = 0.65) {
        this.ballSpeed = ballSpeed;
        this.scene = scene;
        this.tableWidth = tableWidth;
        this.tableDepth = tableDepth;

        // Define a cor primária da mesa
        this.colorPrimary = new Color3(0.2, 0.2, 0.2);
        // Define a cor secundária da mesa
        this.colorSecondary = new Color3(1, 1, 1);
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
            new Vector3(tableHalfWidth + distanceFromTable + 15, 0, 0),
            this.tableDepth,
            30,
            10,
            15,
            90
        );

        this.bleachers.push(rightBleacher);

        // Você pode adicionar mais arquibancadas chamando novamente o construtor com posições diferentes
        // Por exemplo, para colocar nos outros lados:

        // Lado esquerdo (exemplo)
        const leftBleacher = new BleacherSection(
            this.scene,
            new Vector3(-(tableHalfWidth + distanceFromTable + 15), 0, 0),
            this.tableDepth,
            30,
            10,
            15,
            -90
        );
        this.bleachers.push(leftBleacher);

        const frontBleacher1 = new BleacherSection(
            this.scene,
            new Vector3(-80, 0, tableHalfDepth + distanceFromTable),
            this.tableWidth,
            30,
            10,
            15,
            0
        );
        const frontBleacher2 = new BleacherSection(
            this.scene,
            new Vector3(10, 0, tableHalfDepth + distanceFromTable),
            this.tableWidth,
            30,
            10,
            15,
            0
        );
        const frontBleacher3 = new BleacherSection(
            this.scene,
            new Vector3(100, 0, tableHalfDepth + distanceFromTable),
            this.tableWidth,
            30,
            10,
            15,
            0
        );

        this.bleachers.push(frontBleacher1);
        this.bleachers.push(frontBleacher2);
        this.bleachers.push(frontBleacher3);

        const backBleacher1 = new BleacherSection(
            this.scene,
            new Vector3(-80, 0, -(tableHalfDepth + distanceFromTable)),
            this.tableWidth,
            30,
            10,
            15,
            180
        );
        const backBleacher2 = new BleacherSection(
            this.scene,
            new Vector3(10, 0, -(tableHalfDepth + distanceFromTable)),
            this.tableWidth,
            30,
            10,
            15,
            180
        );
        const backBleacher3 = new BleacherSection(
            this.scene,
            new Vector3(100, 0, -(tableHalfDepth + distanceFromTable)),
            this.tableWidth,
            30,
            10,
            15,
            180
        );
        this.bleachers.push(backBleacher1);
        this.bleachers.push(backBleacher2);
        this.bleachers.push(backBleacher3);
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
        this.ball = new Ball(this.scene,
            new Vector3(0, 12, 0),
            this.ballSpeed,
            { width: this.tableWidth, depth: this.tableDepth });

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
        tableTopMaterial.diffuseColor = this.colorPrimary;
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
        legMaterial.diffuseColor = this.colorPrimary;

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
        lineMaterial.diffuseColor = this.colorSecondary;
        lineMaterial.specularColor = this.colorSecondary;
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
        sideBarMaterial.diffuseColor = this.colorSecondary;
        sideBarMaterial.specularColor = this.colorSecondary;
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
            this.ball.update(this.tableWidth, this.tableDepth);
            this.checkBallPaddleCollision();
        }

	}

	private checkBallPaddleCollision(): void {
        const ballMesh = this.ball.getMesh();
        const paddleLeftMesh = this.paddleLeft.getMesh();
        const paddleRightMesh = this.paddleRight.getMesh();

        let velocity = this.ball.getVelocity();

        const paddleHeight = 10;
        // Colisão com paddle esquerdo
        if (ballMesh.intersectsMesh(paddleLeftMesh, false)) {
            if (velocity.x < 0) { // Se estiver se movendo para a esquerda
                // Calcular ponto de colisão relativo ao centro do paddle
                const hitPoint = (ballMesh.position.z - paddleLeftMesh.position.z) / (paddleHeight / 2);

                // Limitar hitPoint entre -1 e 1
                const clampedHitPoint = Math.max(-1, Math.min(1, hitPoint));

                // Ângulo de rebatimento baseado no ponto de impacto
                // Varia entre -30° a 30° (convertido para radianos)
                const bounceAngle = clampedHitPoint * (Math.PI / 6);

                // Calcular nova direção baseada no ângulo
                const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
                const newSpeed = Math.min(speed * 1.05, 1.5); // Aumenta velocidade em 5% até o limite

                // Aplicar nova velocidade com direção calculada
                velocity.x = Math.cos(bounceAngle) * newSpeed;
                velocity.z = Math.sin(bounceAngle) * newSpeed;

                // Reproduzir som de colisão (se implementar no futuro)
                // this.playSound('paddleHit');

                this.ball.setVelocity(velocity);
            }
        }

        // Colisão com paddle direito (mesma lógica, só invertendo o X)
        else if (ballMesh.intersectsMesh(paddleRightMesh, false)) {
            if (velocity.x > 0) { // Se estiver se movendo para a direita
                // Calcular ponto de colisão relativo ao centro do paddle
                const hitPoint = (ballMesh.position.z - paddleRightMesh.position.z) / (paddleHeight / 2);

                // Limitar hitPoint entre -1 e 1
                const clampedHitPoint = Math.max(-1, Math.min(1, hitPoint));

                // Ângulo de rebatimento baseado no ponto de impacto
                const bounceAngle = clampedHitPoint * (Math.PI / 6);

                // Calcular nova direção baseada no ângulo
                const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
                const newSpeed = Math.min(speed * 1.05, 1.5); // Aumenta velocidade em 5% até o limite

                // Aplicar nova velocidade com direção calculada
                velocity.x = -Math.cos(bounceAngle) * newSpeed; // Nota o sinal negativo
                velocity.z = Math.sin(bounceAngle) * newSpeed;

                // Reproduzir som de colisão (se implementar no futuro)
                // this.playSound('paddleHit');

                this.ball.setVelocity(velocity);
            }
        }
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

    /**
     * Obtém a largura da mesa
     */
    public getTableWidth(): number {
        return this.tableWidth;
    }

    /**
     * Obtém a profundidade da mesa
     */
    public getTableDepth(): number {
        return this.tableDepth;
    }
}

export { TableManager };

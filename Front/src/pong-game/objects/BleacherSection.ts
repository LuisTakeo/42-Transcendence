import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";

/**
 * Representa uma seção de arquibancada para o jogo de Pong
 */
class BleacherSection {
    private scene: Scene;
    private rows: Mesh[] = [];
    private seats: Mesh[] = [];
    private basePosition: Vector3;
    private parent: Mesh;
    private rowCount: number;
    private seatsPerRow: number;
    private width: number;
    private depth: number;

    /**
     * Cria uma nova seção de arquibancada
     * @param scene A cena do Babylon
     * @param position Posição base da arquibancada
     * @param width Largura da seção (eixo X)
     * @param depth Profundidade da seção (eixo Z)
     * @param rowCount Número de fileiras
     * @param seatsPerRow Número de assentos por fileira
     * @param angle Ângulo de rotação da seção em graus (em torno do eixo Y)
     */
    constructor(
        scene: Scene,
        position: Vector3,
        width: number = 40,
        depth: number = 15,
        rowCount: number = 5,
        seatsPerRow: number = 8,
        angle: number = 0
    ) {
        this.scene = scene;
        this.basePosition = position;
        this.rowCount = rowCount;
        this.seatsPerRow = seatsPerRow;
        this.width = width;
        this.depth = depth;

        // Criar um container para organizar os elementos
        this.parent = new Mesh("bleacherSection", this.scene);
        this.parent.position = position;
        this.parent.rotation.y = angle * (Math.PI / 180); // Converter graus para radianos

        this.createBleachers();
    }

    /**
     * Cria as fileiras e assentos da arquibancada
     */
    private createBleachers(): void {
        const rowHeight = 1.5; // Altura de cada fileira
        const rowDepth = this.depth / this.rowCount; // Profundidade de cada fileira
        const seatWidth = this.width / this.seatsPerRow; // Largura de cada assento
        const seatHeight = 0.5; // Altura do assento
        const seatDepth = rowDepth * 0.6; // Profundidade do assento

        // Materiais
        const rowMaterial = new StandardMaterial("rowMaterial", this.scene);
        rowMaterial.diffuseColor = new Color3(0.4, 0.4, 0.4); // Cinza para as fileiras

        const seatMaterials = [
            new StandardMaterial("seatMat1", this.scene),
            new StandardMaterial("seatMat2", this.scene),
            new StandardMaterial("seatMat3", this.scene),
        ];

        // Diferentes cores para os assentos
        seatMaterials[0].diffuseColor = new Color3(0.9, 0.2, 0.2); // Vermelho
        seatMaterials[1].diffuseColor = new Color3(0.2, 0.2, 0.9); // Azul
        seatMaterials[2].diffuseColor = new Color3(0.9, 0.9, 0.2); // Amarelo

        // Criar fileiras e assentos
        for (let row = 0; row < this.rowCount; row++) {
            // Cálculo da posição Y de cada fileira (elevação progressiva)
            const rowY = row * rowHeight;

            // Cálculo da posição Z de cada fileira (afastamento progressivo)
            const rowZ = -(this.depth / 2) + row * rowDepth + rowDepth / 2;

            // Criar a fileira (plataforma)
            const bleacherRow = MeshBuilder.CreateBox(`row${row}`, {
                width: this.width,
                height: rowHeight,
                depth: rowDepth
            }, this.scene);

            bleacherRow.position = new Vector3(0, rowY, rowZ);
            bleacherRow.material = rowMaterial;
            bleacherRow.parent = this.parent;
            this.rows.push(bleacherRow);

            // Criar assentos para esta fileira
            for (let seat = 0; seat < this.seatsPerRow; seat++) {
                // Cálculo da posição X do assento (distribuído ao longo da largura)
                const seatX = -(this.width / 2) + seat * seatWidth + seatWidth / 2;

                // Posição Y do assento (topo da fileira)
                const seatY = rowY + rowHeight / 2 + seatHeight / 2;

                // Criar assento
                const bleacherSeat = MeshBuilder.CreateBox(`seat${row}_${seat}`, {
                    width: seatWidth * 0.8,
                    height: seatHeight,
                    depth: seatDepth
                }, this.scene);

                bleacherSeat.position = new Vector3(seatX, seatY, rowZ);

                // Alternar cores para os assentos
                bleacherSeat.material = seatMaterials[row % seatMaterials.length];
                bleacherSeat.parent = this.parent;
                this.seats.push(bleacherSeat);
            }
        }
    }

    /**
     * Configura os objetos da arquibancada para projetar sombras
     * @param shadowGenerator Gerador de sombras
     */
    public configureShadows(shadowGenerator: ShadowGenerator): void {
        // Adicionar todas as fileiras como objetos que projetam sombras
        this.rows.forEach(row => {
            shadowGenerator.addShadowCaster(row);
            row.receiveShadows = true;
        });

        // Adicionar todos os assentos como objetos que projetam sombras
        this.seats.forEach(seat => {
            shadowGenerator.addShadowCaster(seat);
            seat.receiveShadows = true;
        });
    }

    /**
     * Retorna o mesh pai da arquibancada para manipulação
     */
    public getMesh(): Mesh {
        return this.parent;
    }
}

export { BleacherSection };
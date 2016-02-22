export default class {

    constructor(name, position = new BABYLON.Vector3(0, 0, 0), scene) {

        this.name = name;
        this.scene = scene;

        //Абстракная фигура для организации группы
        this.mesh = new BABYLON.AbstractMesh(name, scene);
        this.mesh.position = position;

        let line;
        let color;
        let alpha;

        for (let i = -40; i <= 40; i += 1) {
            color = ((i % 5) !== 0) ? new BABYLON.Color3(0.5, 0.5, 0.5) : new BABYLON.Color3(1, 1, 1);
            alpha = 0.5;

            //Горизонтальная сетка
            line = this.createLine([-40 + position.x, 40 + position.x], [position.y, position.y], [i + position.z, i + position.z], color, alpha);
            line.parent = this.mesh;

            line = this.createLine([i + position.x, i + position.x], [position.y, position.y], [-40 + position.z, 40 + position.z], color, alpha);
            line.parent = this.mesh;

            // Вертикальная сетка только с градацией высоты
            line = this.createLine([position.x, position.x], [i + position.y, i + position.y], [-40 + position.z, 40 + position.z], color, alpha);
            line.parent = this.mesh;
        }
    }

    /**
     * Создать линию
     * @param xRange
     * @param yRange
     * @param zRange
     * @param color
     * @param alpha
     */
    createLine(xRange, yRange, zRange, color = new BABYLON.Color3(1, 1, 1), alpha = 1) {
        let line = BABYLON.Mesh.CreateLines('line', [
            new BABYLON.Vector3(xRange[0], yRange[0], zRange[0]),
            new BABYLON.Vector3(xRange[1], yRange[1], zRange[1]),
        ], this.scene);

        line.color = color;
        line.alpha = alpha;

        return line;
    }
}
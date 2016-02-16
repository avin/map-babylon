import ElementCore from '../ElementCore';

export default class extends ElementCore {

    constructor(Element) {
        super(Element);

        //Точки окончаний и изгибов
        this.pointMeshes = [];

        this._init();
    }

    _init() {
        let coordinates = this.Element.data.coordinates;

        //Инициализируем фигуры точек изгибов
        _.each(coordinates, (coordinate) => {
            let position = new BABYLON.Vector3(coordinate.position.x, coordinate.position.y, coordinate.position.z);
            let parent;

            //Находим родительский элемент по его ID
            let parentElement = _.find(this.Map.elements, (element) => {
                return element._id === coordinate.parent_id
            });

            //Если родитель не является специальным элементом
            if (parentElement && (!parentElement.isSpecial())) {
                parent = parentElement;
            }

            this.initPointMesh(position, parent);
        });

        this.drawLine();
    }

    /**
     * Нарисовать линию
     * @param linePositions
     */
    drawLine() {
        if (this.Element.mesh){
            this.Element.mesh.dispose();
        }

        //Рисуем линию только если кол-во секции больше нуля
        if (this.getSectionsCount() > 0){

            //Определяем координаты точек линии для построения
            let linePositions = _.map(this.pointMeshes, (pointMesh) => {
                return (pointMesh.position.clone());
            });

            /**
             * Рисуем линию в виде трубки
             */

            //Инче создаем новую
            this.Element.mesh = BABYLON.Mesh.CreateTube("lines", linePositions, 0.05, 4, null, 0, this.Map.scene, true);
            this.Element.mesh.material = new BABYLON.StandardMaterial('lineMaterial', this.Map.scene);
            this.Element.mesh.material.diffuseColor = new BABYLON.Color3(1, 0, 0);


            //Рисуем линию в виде нитки
            //this.Element.mesh = BABYLON.Mesh.CreateLines("lines", linePositions, this.Map.scene);
        }
    }

    /**
     * Инициализация точки излома или окончания
     * @param position
     * @param parent
     * @param isAbsolutePosition
     */
    initPointMesh(position, parent, isAbsolutePosition = true) {
        let size = 0.2;
        let point = BABYLON.Mesh.CreateSphere('point', 10, size, this.Map.scene);
        point.material = new BABYLON.StandardMaterial('material', this.Map.scene);
        point.material.diffuseColor = new BABYLON.Color3(1, 1, 0);

        if (isAbsolutePosition){
            point.setAbsolutePosition(position);
        } else {
            point.position = position;
        }

        if (parent){
            //point.parent = parent.mesh;
        }

        this.pointMeshes.push(point);
    }

    /**
     * Добавить точку в линию
     */
    addPoint(absolutePosition, parent){
        //Если такой точки нет - продолжаем
        this.initPointMesh(absolutePosition, parent, true);

        //Перерисовываем линию
        this.drawLine();
    }

    /**
     * Получить кол-во прямых участков на линии
     * @returns {number}
     */
    getSectionsCount(){
        return this.pointMeshes.length - 1;
    }

    update(){
        //this.Element.mesh = BABYLON.Mesh.CreateTube(null, linePositions, 0.05, null, null, null, null, null, null, this.Element.mesh);

        _.each(this.pointMeshes, (pointMesh) => {
            let scale = BABYLON.Vector3.Distance(this.Map.playerCamera.position, pointMesh.getAbsolutePosition()) / 10;
            pointMesh.scaling = new BABYLON.Vector3(scale, scale, scale);
        })
    }
}
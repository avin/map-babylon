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
     * Нарисовать/Перерисовать линию
     */
    drawLine() {
        if (this.Element.mesh){
            this.Element.mesh.dispose();
        }

        //Рисуем линию только если кол-во секции больше нуля
        if (this.getSectionsCount() > 0){

            //Определяем координаты точек линии для построения
            let linePositions = _.map(this.pointMeshes, (pointMesh) => {
                return (pointMesh.getAbsolutePosition());
            });

            /**
             * Рисуем линию в виде трубки
             */

            console.log(linePositions);

            //Инче создаем новую
            this.Element.mesh = BABYLON.Mesh.CreateTube("lines", linePositions, 0.05, 4, null, 0, this.Map.scene, true);
            this.Element.mesh.material = new BABYLON.StandardMaterial('lineMaterial', this.Map.scene);
            this.Element.mesh.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
            this.Element.mesh.element = this.Element;

            console.log(this.Element.mesh);


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
        let point = BABYLON.Mesh.CreateSphere('linePoint', 10, size, this.Map.scene);
        point.material = new BABYLON.StandardMaterial('material', this.Map.scene);
        point.material.diffuseColor = new BABYLON.Color3(1, 1, 0);

        if (parent && !parent.isSpecial()){
            point.parent = parent.mesh;
        }

        if (isAbsolutePosition){
            point.setAbsolutePosition(position);
        } else {
            point.position = position;
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

    /**
     * Показать вспомогательниые фигуры изломов и окончаний для управления
     */
    showPointMeshes(){
        _.each(this.pointMeshes, (pointMesh) => {
            pointMesh.isVisible = true;
        })
    }

    /**
     * Спрятать вспомогательниые фигуры изломов и окончаний для управления
     */
    hidePointMeshes(){
        _.each(this.pointMeshes, (pointMesh) => {
            pointMesh.isVisible = false;
        })
    }

    /**
     * Подсветить линию
     */
    enableHighlight(){
        //Сохраняем оригинальный материал фигуры
        this.Element.mesh.originalMaterial = this.Element.mesh.material;

        //Создаем новый материал для подсветки
        let highlightMaterial = new BABYLON.StandardMaterial('mat', this.Map.scene);
        highlightMaterial.diffuseColor = new BABYLON.Color3(0, 1, 1);

        //Назначаем материал подсветки на фигуру
        this.Element.mesh.material = highlightMaterial;

        this.showPointMeshes();
    }

    /**
     * Убрать подсветку
     */
    disableHighlight(highlightRelated = false){
        //Возвращаем оригинальный материал
        this.Element.mesh.material = this.Element.mesh.originalMaterial;

        this.hidePointMeshes();
    }

    updateLinePositions(){
        console.log('ul');
        //Определяем координаты точек линии для перерисовки
        let linePositions = _.map(this.pointMeshes, (pointMesh) => {
            return (pointMesh.getAbsolutePosition());
        });

        this.Element.mesh = BABYLON.Mesh.CreateTube(null, linePositions, 0.05, null, null, null, null, null, null, this.Element.mesh);
    }

    update(){

        this.updateLinePositions();

        _.each(this.pointMeshes, (pointMesh) => {
            let scale = BABYLON.Vector3.Distance(this.Map.playerCamera.position, pointMesh.getAbsolutePosition()) / 10;
            pointMesh.scaling = new BABYLON.Vector3(scale, scale, scale);
        })
    }
}
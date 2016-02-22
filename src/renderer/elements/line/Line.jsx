import AbstractElement from '../AbstractElement';

export default class extends AbstractElement {

    constructor(scene, elementData) {
        super(scene, elementData);

        //Размер опорной точки
        this.pointMeshSize = 0.3;

        //Размер трубы
        this.tubeRadius = this.pointMeshSize / 3;

        //Точки окончаний и изгибов
        this.pointMeshes = [];

        this._init();
    }

    _init() {
        let coordinates = _.get(this.data, 'coordinates', []);

        //Инициализируем фигуры точек изгибов
        _.each(coordinates, (coordinate) => {
            let position = new BABYLON.Vector3(coordinate.position.x, coordinate.position.y, coordinate.position.z);
            let parent;

            //Находим родительский элемент по его ID
            let parentElement = _.find(this.scene.elements, (element) => {
                return element._id === coordinate.parent_id
            });

            //Если родитель не является специальным элементом
            if (parentElement && (!parentElement.isSpecial())) {
                parent = parentElement;
            }

            this.initPointMesh(position, parent);
        });

        this.drawLine();

        super._init();
    }

    /**
     * Нарисовать/Перерисовать линию
     */
    drawLine() {
        if (this.mesh) {
            this.mesh.dispose();
            this.line.dispose();
        }

        //Рисуем линию только если кол-во секции больше нуля
        if (this.getSectionsCount() > 0) {

            //Определяем координаты точек линии для построения
            let linePositions = _.map(this.pointMeshes, (pointMesh) => {
                pointMesh.computeWorldMatrix(true);
                return (pointMesh.getAbsolutePosition());
            });

            /**
             * Рисуем линию в виде трубки
             */

            //Инче создаем новую
            this.mesh = BABYLON.Mesh.CreateTube('lines', linePositions, this.tubeRadius, 3, null, 0, this.scene, true);
            this.mesh.freezeNormals();

            //Рисуем линию в виде нитки
            this.line = BABYLON.Mesh.CreateLines('lines', linePositions, this.scene, true);

            this.setMaterial();

            //Оставляем в mesh-e сслыку на родительский объект
            if (this.mesh) {
                this.mesh.element = this;
            }
        }
    }

    /**
     * Привязка опорной точки к родителю
     * @param pointMesh
     * @param parentElement
     */
    setPointMeshParentElement(pointMesh, parentElement) {
        if (parentElement && (!parentElement.isSpecial())) {
            pointMesh.parent = parentElement.mesh;
        }
    }

    /**
     * Инициализация точки излома или окончания
     * @param position
     * @param parentElement
     * @param isAbsolutePosition
     */
    initPointMesh(position, parentElement, isAbsolutePosition = true) {
        let point = BABYLON.Mesh.CreateSphere('linePoint', 10, this.pointMeshSize, this.scene, false, BABYLON.Mesh.FRONTSIDE);
        point.material = new BABYLON.StandardMaterial('material', this.scene);
        point.material.diffuseColor = new BABYLON.Color3.Yellow();

        //Материал не реагирует на свет
        point.material.emissiveColor = BABYLON.Color3.White();
        point.material.linkEmissiveWithDiffuse = true;

        //Материал прозрачен
        point.material.alpha = 0.5;
        point.element = this;

        this.setPointMeshParentElement(point, parentElement);

        if (isAbsolutePosition) {
            point.setAbsolutePosition(position);
        } else {
            point.position = position;
        }

        this.pointMeshes.push(point);
    }

    /**
     * Добавить точку в линию
     */
    addPoint(absolutePosition, parent) {
        //Если такой точки нет - продолжаем
        this.initPointMesh(absolutePosition, parent, true);

        //Перерисовываем линию
        this.drawLine();
    }

    /**
     * Получить кол-во прямых участков на линии
     * @returns {number}
     */
    getSectionsCount() {
        return this.pointMeshes.length - 1;
    }

    /**
     * Показать вспомогательниые фигуры изломов и окончаний для управления
     */
    showPointMeshes() {
        _.each(this.pointMeshes, (pointMesh) => {
            pointMesh.isVisible = true;
        })
    }

    /**
     * Спрятать вспомогательниые фигуры изломов и окончаний для управления
     */
    hidePointMeshes() {
        _.each(this.pointMeshes, (pointMesh) => {
            pointMesh.isVisible = false;
        })
    }

    /**
     * Подсветить линию
     */
    enableHighlight() {
        if (this.mesh){
            //Создаем новый материал для подсветки
            let highlightMaterial = new BABYLON.StandardMaterial('mat', this.scene);
            highlightMaterial.diffuseColor = new BABYLON.Color3(0, 1, 1);

            //Назначаем материал подсветки на фигуру
            this.mesh.material = highlightMaterial;
        }

        //Показываем опорные точки
        this.showPointMeshes();
    }

    /**
     * Убрать подсветку
     */
    disableHighlight(highlightRelated = false) {
        //Выставляем оригинальный материал
        this.setMaterial();

        //Прячем опорные точки
        this.hidePointMeshes();
    }

    /**
     * Выставить нормальный режим отображения для элемента
     */
    setVisibilityNormal(){
        super.setVisibilityNormal();

        //Показываем трубку
        if (this.mesh){
            this.mesh.visibility = 1;
        }

        //Прячем линию
        if (this.line){
            this.line.visibility = 0;
        }
    }

    /**
     * Выставить прозрачный режим отображения для элемента
     */
    setVisibilityTransparent(){
        super.setVisibilityTransparent();

        //Прячем трубку
        if (this.mesh){
            this.mesh.visibility = 0;
        }

        //Показываем линию
        if (this.line){
            this.line.visibility = 1;
        }
    }

    /**
     * Выставить скрытый режим отображения для элемента
     */
    setVisibilityHidden(){
        super.setVisibilityHidden();

        //Прямчем трубку
        if (this.mesh){
            this.mesh.visibility = 0;
        }

        //Прямчем линию
        if (this.line){
            this.line.visibility = 0;
        }
    }

    /**
     * Поменять координаты линии без перерисовки
     */
    updateLinePositions() {
        //Определяем координаты точек линии для перерисовки
        let linePositions = _.map(this.pointMeshes, (pointMesh) => {
            return (pointMesh.getAbsolutePosition());
        });

        //Если есть хотябы один прямой участок на линии
        if (this.getSectionsCount() > 0){

            //Обновляем трубку
            this.mesh = BABYLON.Mesh.CreateTube(null, linePositions, 0.05, null, null, null, null, null, null, this.mesh);

            //Обновляем нитку
            this.line = BABYLON.Mesh.CreateLines(null, linePositions, null, null, this.line);
        }
    }

    setMaterial(specialColor){
        if(this.line){
            this.line.color = super.setMaterial(specialColor);
        }
    }

    /**
     * Покадровое обновление элемента
     */
    update() {
        //Перестраиваем положение линии в зависимости от положения опорных точек
        this.updateLinePositions();

        //Увеличиываем размер опорных точек в зависимости от удаленности камеры
        _.each(this.pointMeshes, (pointMesh) => {
            let scale = BABYLON.Vector3.Distance(this.scene.playerCamera.position, pointMesh.getAbsolutePosition()) / 10;
            pointMesh.scaling = new BABYLON.Vector3(scale, scale, scale);
        })
    }
}
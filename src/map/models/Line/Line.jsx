import ElementCore from '../ElementCore';

export default class extends ElementCore {

    constructor(Element) {
        super(Element);

        this.pointMeshSize = 0.3;
        this.tubeRadius = this.pointMeshSize / 3;

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
        if (this.Element.mesh) {
            this.Element.mesh.dispose();
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
            this.Element.mesh = BABYLON.Mesh.CreateTube("lines", linePositions, this.tubeRadius, 3, null, 0, this.Map.scene, true);

            //Рисуем линию в виде нитки
            this.Element.line = BABYLON.Mesh.CreateLines("lines", linePositions, this.Map.scene, true);

            this.setMaterial();

            //Оставляем в mesh-e сслыку на родительский объект
            if (this.Element.mesh) {
                this.Element.mesh.element = this.Element;
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
        let point = BABYLON.Mesh.CreateSphere('linePoint', 10, this.pointMeshSize, this.Map.scene);
        point.material = new BABYLON.StandardMaterial('material', this.Map.scene);
        point.material.diffuseColor = new BABYLON.Color3(1, 1, 0);
        point.material.alpha = 0.5;
        point.element = this.Element;

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
    disableHighlight(highlightRelated = false) {
        //Возвращаем оригинальный материал
        this.setMaterial();

        this.hidePointMeshes();
    }

    /**
     * Выставить нормальный режим отображения для элемента
     */
    setVisibilityNormal(){
        super.setVisibilityNormal();

        if (this.Element.mesh){
            this.Element.mesh.visibility = 1;
        }

        if (this.Element.line){
            this.Element.line.visibility = 0;
        }
    }

    /**
     * Выставить прозрачный режим отображения для элемента
     */
    setVisibilityTransparent(){
        super.setVisibilityTransparent();

        if (this.Element.mesh){
            this.Element.mesh.visibility = 0;
        }

        if (this.Element.line){
            this.Element.line.visibility = 1;
        }
    }

    /**
     * Выставить скрытый режим отображения для элемента
     */
    setVisibilityHidden(){
        super.setVisibilityHidden();

        if (this.Element.mesh){
            this.Element.mesh.visibility = 0;
        }

        if (this.Element.line){
            this.Element.line.visibility = 0;
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

        this.Element.mesh = BABYLON.Mesh.CreateTube(null, linePositions, 0.05, null, null, null, null, null, null, this.Element.mesh);

        //Рисуем линию в виде нитки
        this.Element.line = BABYLON.Mesh.CreateLines(null, linePositions, null, null, this.Element.line);
    }

    setMaterial(){
        this.Element.line.color = super.setMaterial();
    }

    update() {

        //Перестраиваем положение линии в зависимости от положения опорных точек
        this.updateLinePositions();

        //Увеличиываем размер опорных точек в зависимости от удаленности камеры
        _.each(this.pointMeshes, (pointMesh) => {
            let scale = BABYLON.Vector3.Distance(this.Map.playerCamera.position, pointMesh.getAbsolutePosition()) / 10;
            pointMesh.scaling = new BABYLON.Vector3(scale, scale, scale);
        })
    }
}
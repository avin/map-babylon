import AbstractElement from '../AbstractElement';

export default class extends AbstractElement {

    constructor(Map, elementData) {
        super(Map, elementData);

        this._init();
    }

    _init() {
        if (this.data.custom_model) {
            //Если у элемента индивидуальная модель
            //TODO
        } else {
            //Иначе используем модель типа
            if (this.type.default_model) {
                //Только если модель для данного типа загружена
                this.mesh = this.Map.models[this.type.default_model].createInstance(this._id);
                this.mesh.scaling = new BABYLON.Vector3(1, 1, 1);

                let elementPosition = this.data.location.position;
                this.mesh.position = new BABYLON.Vector3(elementPosition.x, elementPosition.y, elementPosition.z);
            }
        }

        this.setMaterial();

        super._init();
    }

    /**
     * Подсветить элемент
     */
    enableHighlight(highlightRelated = false){
        super.enableHighlight();

        this.mesh.showBoundingBox = true;
        //Если подсвечивать родственные элементы
        if (highlightRelated){

            //Обходим элементы системы в поисках потомков
            _.each(this.Map.elements, (element) => {
                if (_.eq(element.parent, this)){
                    //И подсвечиваем их и их потомков
                    element.enableHighlight(true);
                }
            })
        }
    }

    /**
     * Убрать подсветку
     */
    disableHighlight(highlightRelated = false){
        super.disableHighlight();

        //Если подсвечены родственные элементе - обходим все элементы системы
        if (highlightRelated){
            _.each(this.Map.elements, (element) => {
                element.disableHighlight();
            });
        } else {
            this.mesh.showBoundingBox = false;
        }
    }

    /**
     * Выставить нормальный режим отображения для элемента
     */
    setVisibilityNormal(){
        super.setVisibilityNormal();

        let mesh = this.mesh.sourceMesh || this.mesh;

        mesh.visibility = 1;
        mesh.material.alpha = 1;
    }

    /**
     * Выставить прозрачный режим отображения для элемента
     */
    setVisibilityTransparent(){
        super.setVisibilityTransparent();

        let mesh = this.mesh.sourceMesh || this.mesh;

        mesh.visibility = 1;
        mesh.material.alpha = 0.3;
    }

    /**
     * Выставить скрытый режим отображения для элемента
     */
    setVisibilityHidden(){
        super.setVisibilityHidden();

        let mesh = this.mesh.sourceMesh || this.mesh;

        mesh.visibility = 0;
        mesh.material.alpha = 1;
    }


    /**
     * Покадровое обновление элемента
     */
    update() {

    }
}
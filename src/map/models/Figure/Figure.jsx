import ElementCore from '../ElementCore';

export default class extends ElementCore {

    constructor(Element) {
        super(Element);

        this._init()
    }

    _init() {
        if (this.Element.data.custom_model) {
            //Если у элемента индивидуальная модель
            //TODO
        } else {
            //Иначе используем модель типа
            if (this.Element.type.default_model) {
                //Только если модель для данного типа загружена
                this.Element.mesh = this.Map.models[this.Element.type.default_model].createInstance(this._id);
                this.Element.mesh.scaling = new BABYLON.Vector3(1, 1, 1);

                let elementPosition = this.Element.data.location.position;
                this.Element.mesh.position = new BABYLON.Vector3(elementPosition.x, elementPosition.y, elementPosition.z);
            }
        }

        this.setMaterial();
    }

    /**
     * Подсветить элемент
     */
    enableHighlight(highlightRelated = false){
        this.Element.mesh.showBoundingBox = true;
        //Если подсвечивать родственные элементы
        if (highlightRelated){

            //Обходим элементы системы в поисках потомков
            _.each(this.Map.elements, (element) => {
                if (_.eq(element.parent, this.Element)){
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
        //Если подсвечены родственные элементе - обходим все элементы системы
        if (highlightRelated){
            _.each(this.Map.elements, (element) => {
                element.disableHighlight();
            });
        } else {
            this.Element.mesh.showBoundingBox = false;
        }
    }

    /**
     * Выставить нормальный режим отображения для элемента
     */
    setVisibilityNormal(){
        super.setVisibilityNormal();

        let mesh = this.Element.mesh.sourceMesh || this.Element.mesh;

        mesh.visibility = 1;
        mesh.material.alpha = 1;
    }

    /**
     * Выставить прозрачный режим отображения для элемента
     */
    setVisibilityTransparent(){
        super.setVisibilityTransparent();

        let mesh = this.Element.mesh.sourceMesh || this.Element.mesh;

        mesh.visibility = 1;
        mesh.material.alpha = 0.3;
    }

    /**
     * Выставить скрытый режим отображения для элемента
     */
    setVisibilityHidden(){
        super.setVisibilityHidden();

        let mesh = this.Element.mesh.sourceMesh || this.Element.mesh;

        mesh.visibility = 0;
        mesh.material.alpha = 1;
    }


    /**
     * Покадровое обновление элемента
     */
    update() {

    }
}
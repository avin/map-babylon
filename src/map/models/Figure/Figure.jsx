export default class {

    constructor(Element) {
        this.Element = Element;
        this.Map = Element.Map;

        this._init()
    }

    _init() {
        if (this.Element.data.custom_model){
            //Если у элемента индивидуальная модель
            //TODO
        } else {
            //Иначе используем модель типа
            if (this.Element.type.default_model){
                //Только если модель для данного типа загружена
                this.Element.mesh = this.Map.models[this.Element.type.default_model].createInstance(this._id);
                this.Element.mesh.scaling = new BABYLON.Vector3(1, 1, 1);

                let elementPosition = this.Element.data.location.position;
                this.Element.mesh.position = new BABYLON.Vector3(elementPosition.x, elementPosition.y, elementPosition.z);
            }
        }
    }

    /**
     * Покадровое обновление элемента
     */
    update(){

    }
}
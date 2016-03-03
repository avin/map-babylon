import AbstractElement from '../AbstractElement';
import options from '../../../options'

export default class extends AbstractElement {

    constructor(scene, elementData) {
        super(scene, elementData);

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
                this.mesh = this.scene.models[this.type.default_model].createInstance(this._id);
                this.mesh.scaling = new BABYLON.Vector3(1, 1, 1);

                let elementPosition = this.data.location.position;
                this.mesh.position = new BABYLON.Vector3(elementPosition.x, elementPosition.y, elementPosition.z);
            }
        }

        this.initMaterials();

        //При отдалении фигура становится невидимой
        this.setLODLevel(options.LODLevel);

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
            _.each(this.scene.elements, (element) => {
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
            _.each(this.scene.elements, (element) => {
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

        //Выставляем текстуру в зависимости от текущей подсветки
        if (this.flags.mountCompatible === 1){
            mesh.material = mesh.materials.mountCompatible;
        } else if (this.flags.mountCompatible === 0){
            mesh.material = mesh.materials.mountIncompatible;
        } else {
            mesh.material = mesh.materials.original;
        }

    }

    /**
     * Выставить прозрачный режим отображения для элемента
     */
    setVisibilityTransparent(){
        super.setVisibilityTransparent();

        let mesh = this.mesh.sourceMesh || this.mesh;
        mesh.visibility = 1;

        //Выставляем текстуру в зависимости от текущей подсветки
        if (this.flags.mountCompatible === 1){
            mesh.material = mesh.materials.mountCompatibleTransparent;
        } else if (this.flags.mountCompatible === 0){
            mesh.material = mesh.materials.mountIncompatibleTransparent;
        } else {
            mesh.material = mesh.materials.originalTransparent;
        }
    }

    /**
     * Выставить скрытый режим отображения для элемента
     */
    setVisibilityHidden(){
        super.setVisibilityHidden();

        let mesh = this.mesh.sourceMesh || this.mesh;
        mesh.visibility = 0;
    }


    /**
     * Покадровое обновление элемента
     */
    update() {

    }
}
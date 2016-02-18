import AbstractElement from '../AbstractElement';

export default class extends AbstractElement {

    constructor(Map, elementData, options = {}) {
        super(Map, elementData);

        this.options = {};
        this.options.style = options.style || 'simple';

        this._init();
    }

    _init() {
        switch (this.options.style) {
            case 'simple' :
                this.createSimpleGround();
                break;
            case 'tile' :
                this.createTileGround();
                break;
            default:
                //Если иначе - значит купола нет (выходим)
                return false;
        }

        super._init();
    }

    /**
     * Создать простой граунд
     */
    createSimpleGround() {
        let drawDistance = 1000;

        // Создаем объект
        this.mesh = new BABYLON.Mesh.CreateGround("ground", drawDistance, drawDistance, 50, this.Map.scene);

        this.setMaterial();
    }

    /**
     * Создать граунд с тайловой текстурой
     */
    createTileGround() {
        //TODO
    }

    /**
     * Выставить нормальный режим отображения для элемента
     */
    setVisibilityNormal(){
        super.setVisibilityNormal();

        this.mesh.visibility = 1;
        this.mesh.material.alpha = 1;
    }

    /**
     * Выставить прозрачный режим отображения для элемента
     */
    setVisibilityTransparent(){
        super.setVisibilityTransparent();

        this.mesh.visibility = 1;
        this.mesh.material.alpha = 0.3;
    }

    /**
     * Выставить скрытый режим отображения для элемента
     */
    setVisibilityHidden(){
        super.setVisibilityHidden();

        this.mesh.visibility = 0;
        this.mesh.material.alpha = 1;
    }

    /**
     * Покадровое обновление элемента
     */
    update() {
        if (this.mesh) {
            //Двигаем землю вместе с камерой
            this.mesh.position.x = this.Map.scene.activeCamera.position.x;
            this.mesh.position.z = this.Map.scene.activeCamera.position.z
        }
    }
}
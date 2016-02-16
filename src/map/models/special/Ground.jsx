import ElementCore from '../ElementCore';

export default class extends ElementCore {

    constructor(Element, options = {}) {
        super(Element);

        this.options = {};
        this.options.style = options.style || 'simple';

        this._init()
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
    }

    /**
     * Создать простой граунд
     */
    createSimpleGround() {
        let drawDistance = 1000;

        // Создаем объект
        this.Element.mesh = new BABYLON.Mesh.CreateGround("ground", drawDistance, drawDistance, 50, this.Map.scene);

        // Добавляем материал
        this.Element.mesh.material = new BABYLON.StandardMaterial("groundMaterial", this.Map.scene);
        this.Element.mesh.material.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.5);
        this.Element.mesh.material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        this.Element.mesh.material.glossiness = 0.2;
    }

    /**
     * Создать граунд с тайловой текстурой
     */
    createTileGround() {
        //TODO
    }

    /**
     * Покадровое обновление элемента
     */
    update() {
        if (this.Element.mesh) {
            //Двигаем землю вместе с камерой
            this.Element.mesh.position.x = this.Map.scene.activeCamera.position.x;
            this.Element.mesh.position.z = this.Map.scene.activeCamera.position.z
        }
    }
}
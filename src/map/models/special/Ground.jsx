export default class {

    constructor(Map, options = {}) {

        this.options = {};
        this.options.style = options.style || 'simple';

        this.Map = Map;

        this.mesh = null;

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

    createSimpleGround(){
        let drawDistance = 1000;

        // Создаем объект
        this.mesh = new BABYLON.Mesh.CreateGround("ground", drawDistance, drawDistance, 50, this.Map.scene);

        // Добавляем материал
        this.mesh.material = new BABYLON.StandardMaterial("groundMaterial", this.Map.scene);
        this.mesh.material.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.5);
        this.mesh.material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        this.mesh.material.glossiness = 0.2;
    }

    createTileGround(){
        //TODO
    }

    update(){
        if (this.mesh){
            //Двигаем землю вместе с камерой
            this.mesh.position.x = this.Map.scene.activeCamera.position.x;
            this.mesh.position.z = this.Map.scene.activeCamera.position.z
        }
    }
}
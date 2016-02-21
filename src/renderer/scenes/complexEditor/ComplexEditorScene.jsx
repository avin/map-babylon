import Scene from '../Scene'

export default class extends Scene {

    constructor(engine) {
        super(engine);

        this._init();
    }

    _init(){
        //Фон сцены
        this.clearColor = new BABYLON.Color3(0.05, 0.33, 0.63);

        //Создание камеры сцены
        //this.scene = complexEditorCamera.create(this, {});

        //grid.create(this.complexEditorScene);
    }
}
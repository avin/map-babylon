export default class extends BABYLON.Scene {

    constructor(engine) {
        super(engine);

        this.renderer = engine.renderer;

        //Загруженные модели
        this.models = [];

        //Объект управления
        this.control = null;
    }
}
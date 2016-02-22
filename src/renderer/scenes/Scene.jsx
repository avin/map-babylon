export default class extends BABYLON.Scene {

    constructor(engine) {
        super(engine);

        this.renderer = engine.renderer;

        //Загруженные модели
        this.models = [];

        //Объект управления
        this.control = null;
    }

    /**
     * Отключить управление камеры
     */
    disableControl() {
        this.activeCamera.detachControl(this.getEngine().getRenderingCanvas());
    }

    /**
     * Включить управление камеры
     */
    enableControl() {
        this.activeCamera.attachControl(this.getEngine().getRenderingCanvas(), false);
    }
}
export default class extends BABYLON.FreeCamera {


    constructor(name, position, scene, options) {
        super(name, position, scene);

        this.speed = options.speed || 10;
        this.angularSensibility = options.angularSensibility || 1000;
        this.accelerator = options.accelerator || 1;
        this.inertia = options.inertia  || 0.5;

        //Начальная Позиция камеры (сверху немного на удалении от центра)
        this.position = options.position || new BABYLON.Vector3(10, 10, 10);

        //Направление камеры (смотрим в нулевую точку)
        this.setTarget(new BABYLON.Vector3.Zero());

        //Маска слоя
        this.layerMask = 2;
    }
}
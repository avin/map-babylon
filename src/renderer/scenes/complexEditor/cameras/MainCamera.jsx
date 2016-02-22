export default class extends BABYLON.ArcRotateCamera {

    constructor(name, alpha, beta, radius, target, scene, options) {
        super(name, alpha, beta, radius, target, scene);

        this.speed = options.speed || 10;
        this.angularSensibilityX  = options.angularSensibility || 1000;
        this.angularSensibilityY  = options.angularSensibility || 1000;
        this.accelerator = options.accelerator || 1;
        this.inertia = options.inertia  || 0.5;

        //Направление камеры (смотрим в нулевую точку)
        this.setTarget(new BABYLON.Vector3.Zero());
    }
}
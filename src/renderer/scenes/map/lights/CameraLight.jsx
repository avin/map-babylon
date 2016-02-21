export default class extends BABYLON.PointLight {

    constructor(name, direction, scene, options) {
        super(name, direction, scene);

        this.intensity = options.intensity || 0.6;

        //Привязываем перемещение светильника к камере
        this.position = scene.playerCamera.position;
    }

}
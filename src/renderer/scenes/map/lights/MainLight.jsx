export default class extends BABYLON.DirectionalLight {

    constructor(name, direction, scene, options) {
        super(name, direction, scene);

        this.position = options.position || new BABYLON.Vector3(200, 200, -200);
        this.intensity = options.intensity || 0.7;
    }

}
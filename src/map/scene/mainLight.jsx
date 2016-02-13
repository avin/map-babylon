export default {

    create(Map, options = {}){

        //Добавляем главный светильник
        let light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(-1, -1, 1), Map.scene);
        light.position = options.position || new BABYLON.Vector3(200, 200, -200);
        light.intensity = options.intensity || 0.7;

        return light;
    }

}
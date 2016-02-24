export default {

    create(Map, camera, options={}){

        //Добавляем вспомогательный светильник
        let light = new BABYLON.PointLight('cameraLight', new BABYLON.Vector3(1, 10, 1), Map.scene);
        light.intensity = options.intensity || 0.6;

        //Привязываем перемещение светильника к камере
        light.position = camera.position;

        return light;
    }

}
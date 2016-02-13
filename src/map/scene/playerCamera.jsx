export default {

    create(Map, options = {}){

        let camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0.0, 0.0, 0.0), Map.scene);
        camera.speed = options.speed || 10;
        camera.angularSensibility = options.angularSensibility || 1000;
        camera.accelerator = options.accelerator || 1;
        camera.inertia = options.inertia  || 0.5;

        //Начальная Позиция камеры (сверху немного на удалении от центра)
        camera.position = options.position || new BABYLON.Vector3(10, 10, 10);

        //Направление камеры (смотрим в нулевую точку)
        camera.setTarget(new BABYLON.Vector3.Zero());

        //Маска слоя
        camera.layerMask = 2;

        //Привязываем к активным камерам
        Map.scene.activeCameras.push(camera);
        Map.scene.activeCamera = camera;
        Map.scene.activeCamera.attachControl(Map.canvas, false);

        //Через эту камеру будут производиться действия с элементами
        Map.scene.cameraToUseForPointers = camera;

        return camera;
    }

}
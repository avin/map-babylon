export default {

    create(Map, options = {}){

        let camera = new BABYLON.ArcRotateCamera('ArcRotateCamera', 1, 0.8, 10, new BABYLON.Vector3(0, 0, 0), Map.complexEditorScene);
        camera.speed = options.speed || 10;
        camera.angularSensibilityX  = options.angularSensibility || 1000;
        camera.angularSensibilityY  = options.angularSensibility || 1000;
        camera.accelerator = options.accelerator || 1;
        camera.inertia = options.inertia  || 0.5;

        //Привязываем камеру к сцене
        Map.complexEditorScene.activeCamera = camera;
        Map.complexEditorScene.activeCamera.attachControl(Map.canvas, false);

        //Через эту камеру будут производиться действия с элементами
        Map.complexEditorScene.cameraToUseForPointers = camera;

        return camera;
    }

}
import Scene from '../Scene'
import MainCamera from './cameras/MainCamera'
import Grid from '../../helperFigures/Grid'

//Светильники используем из сцены карты
import CameraLight from '../map/lights/CameraLight'
import MainLight from '../map/lights/MainLight'

export default class extends Scene {

    constructor(engine) {
        super(engine);

        //Персональное имя сцены
        this.name = 'complexEditor';

        this._init();
    }

    _init(){
        //Фон сцены
        this.clearColor = new BABYLON.Color3(0.05, 0.33, 0.63);

        //Дебаг
        //this.debugLayer.show();

        this._initCamera();
        this._initLights();

        this.grid = new Grid('grid', new BABYLON.Vector3.Zero(), this);
    }

    /**
     * Инициализация камеры
     * @private
     */
    _initCamera(){
        let mainCameraOptions = {};
        let mainCamera = new MainCamera('ArcRotateCamera', 1, 0.8, 10, new BABYLON.Vector3(0, 0, 0), this, mainCameraOptions);

        //Привязываем камеру к сцене
        this.activeCamera = mainCamera;

        //Привязываем управление к камере
        mainCamera.attachControl(this.getEngine().getRenderingCanvas(), false);

        //Через эту камеру будут производиться действия с элементами
        this.cameraToUseForPointers = mainCamera;
    }

    /**
     * Инициализация светильников
     * @private
     */
    _initLights(){
        let mainLightOptions = {};
        this.mainLight = new MainLight('MainLight', new BABYLON.Vector3(-1, -1, 1), this, mainLightOptions);

        let cameraLightOptions = {};
        this.cameraLight = new CameraLight('cameraLight', new BABYLON.Vector3(1, 10, 1), this, cameraLightOptions);
    }
}
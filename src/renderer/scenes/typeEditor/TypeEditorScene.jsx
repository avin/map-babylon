import SceneWithElements from '../SceneWithElements'
import MainCamera from './cameras/MainCamera'
import Grid from '../../helperFigures/Grid'
import Control from '../../control/Control';
import ElementDispatcher from './../../elements/ElementDispatcher';

//Светильники используем из сцены карты
import CameraLight from '../map/lights/CameraLight'
import MainLight from '../map/lights/MainLight'

//Импорт данных
import typeCatalog from '../../../data/type_catalog.json'

export default class extends SceneWithElements {

    constructor(engine) {
        super(engine);

        //Персональное имя сцены
        this.name = 'typeEditor';

        //Каталог типов элементов берем из главной сцены
        this.typeCatalog = this.renderer.scenes.map.typeCatalog;

        //Каталог моделей
        this.models = [];

        //Массив элементов на сцене
        this.elements = [];

        //Диспетчер тестовых элементов
        this.elementDispatcher = new ElementDispatcher(this);

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

        //Загрузчик ресурсов
        let loader = new BABYLON.AssetsManager(this);

        //Загружаем все типовые модели из каталога
        _.each(this.typeCatalog, (type) => {
            //Если у типа есть модель
            let modelName = _.get(type, 'default_model');
            if (modelName) {
                let meshTask = loader.addMeshTask(modelName, '', './assets/models/', `${modelName}.obj`);
                meshTask.onSuccess = (t) => {
                    //Добавляем модель в единый массив
                    this.models[modelName] = BABYLON.Mesh.MergeMeshes(t.loadedMeshes);
                    //Уменьшаем размер исходной фигуры до нулевого состояния
                    this.models[modelName].scaling = new BABYLON.Vector3(0, 0, 0);
                    this.models[modelName].material = new BABYLON.StandardMaterial('material', this);
                };
            }
        });

        loader.load();
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

    loadType(elementType){
        //TODO очистить сцену от старого типа
        _.each(this.elements, (element)=> {
            if (element){
                element.remove();
            }
        });

        //Добавить пробный элемент заданного типа
        this.appendElement(elementType)
    }

    /**
     * Загрузить фигуры типа в сцену
     * @param elementType
     */
    appendElement(elementType){
        //Если имеем дело с комплексным типом - используем другую функцию
        if (elementType.kind === 'complex') {
            return this._appendComplexElement(elementType);
        } else {
            return this._appendSingleElement(elementType);
        }

    }


    /**
     * Добавить одиночный элемент
     * @param elementType
     * @returns {*}
     */
    _appendSingleElement(elementType){
        let newElementData = {
            type_id: elementType._id,
            properties: [],
            parent: 1,
            location: {
                position: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                }
            },
            custom_model: false,
            history: [],
            states: []
        };

        let appendingElement = this.elementDispatcher.createElement(newElementData);

        //this.control.setCurrentElement(appendingElement);

        return appendingElement;
    }

    /**
     * Добавить комплексный элемент
     * @param elementType
     * @private
     */
    _appendComplexElement(elementType){
        let parts = [];

        //Создаем элемент по каждой части элемента
        _.each(elementType.parts, (part) => {

            let partElementType = this.typeCatalog[part.type_id];

            let newElementData = {
                type_id: partElementType._id,
                properties: [],
                parent: 1,
                location: {
                    position: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    rotation: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                },
                custom_model: false,
                history: [],
                states: []
            };

            let appendingElement = this.elementDispatcher.createElement(newElementData);

            //Делаем привязку к родительскому элементу
            if (part.parent !== undefined){
                let parentElement = parts[part.parent];
                appendingElement.setParent(parentElement);

                appendingElement.mesh.position = new BABYLON.Vector3(part.position.x, part.position.y, part.position.z);
            }

            parts.push(appendingElement);
        });

        //Первый элемент в стеке комплексного элемента всегда является родительским
        //this.control.setCurrentElement(parts[0]);
    }
}
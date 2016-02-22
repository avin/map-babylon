import Scene from '../Scene'

import PlayerCamera from './cameras/PlayerCamera';
import MiniMapCamera from './cameras/MiniMapCamera';
import MainLight from './lights/MainLight';
import CameraLight from './lights/CameraLight';

//import filter from './scene/filter';
//import grid from './scene/grid';
//import UndoStack from './UndoStack';
import Control from '../../control/Control';
import ElementDispatcher from './../../elements/ElementDispatcher';

import {CONTROL_MODES} from '../../../constants'

//Импорт данных
import typeCatalog from '../../../data/type_catalog.json'
import elementCatalog from '../../../data/element_catalog.json'

export default class extends Scene {

    constructor(engine) {
        super(engine);

        //Персональное имя сцены
        this.name = 'map';

        //Каталог типов элементов
        this.typeCatalog = _.keyBy(typeCatalog, '_id');

        //Каталог элементов
        this.elementCatalog = _.keyBy(elementCatalog, '_id');

        //Диспетчер элементов
        this.elementDispatcher = new ElementDispatcher(this);

        //Массив элементов на карте
        this.elements = [];

        //Определения стека отмены действий
        //this.undoStack = new UndoStack(this);

        //Внутренее время сцены
        this.time = 0.0;

        this._init();
    }

    _init() {
        //Цвет фона
        this.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);

        //Дебаг
        //this.debugLayer.show();

        //Оптимизация ФПС
        BABYLON.SceneOptimizer.OptimizeAsync(this, BABYLON.SceneOptimizerOptions.ModerateDegradationAllowed(50),
            () => {
                console.log('Optimized ModerateDegradation')
            },
            () => {
                BABYLON.SceneOptimizer.OptimizeAsync(this, BABYLON.SceneOptimizerOptions.HighDegradationAllowed(40),
                    () => {
                        console.log('Optimized by HighDegradation')
                    },
                    () => {
                        console.log('Bad FPS!!!');
                    });
            });


        this._initCameras();
        this._initLights();
        this._initControl();

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
                    //this.models[modelName].setEnabled(false);
                    this.models[modelName].material = new BABYLON.StandardMaterial('material', this);
                };
            }
        });

        loader.onFinish = () => {

            this.executeWhenReady(() => {
                this.renderer.setActiveScene(this.name);
            });

            this._initContent();

        };

        loader.load();
    }


    /**
     * Инициализация камер
     * @private
     */
    _initCameras(){
        //Главная камера
        let playerCameraOptions = {};
        this.playerCamera = new PlayerCamera('PlayerCamera', new BABYLON.Vector3(0.0, 0.0, 0.0), this, playerCameraOptions);
        this.activeCameras.push(this.playerCamera);

        //Привязываем управление к камере
        this.playerCamera.attachControl(this.getEngine().getRenderingCanvas(), false);

        //Через эту камеру будут производиться действия с элементами
        this.cameraToUseForPointers = this.playerCamera;

        //Мини камера
        //this.miniMapCamera = new MiniMapCamera();

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

    /**
     * Инициализация управления
     * @private
     */
    _initControl(){
        this.control = new Control(this);
    }

    /**
     * Инициализация содержимого сцены
     * @private
     */
    _initContent() {

        //Расставляем все элементы из базы элементов
        _.each(this.elementCatalog, (elementData) => {
            this.elementDispatcher.createElement(elementData);
        });

        this.beforeRender = () => {
            let delta = this.getEngine().getDeltaTime() / 1000.0;
            this.time += delta;

            this._update(delta, this.time);
        };
    }

    /**
     * Функция отвечающая за инициализацию покадровых действий
     * @param delta
     * @param time
     * @private
     */
    _update(delta, time) {

        _.each(this.elements, (element) => {
            element.update(delta, time);
        });

        this.control.update();

        //this.playerCamera.position.x = Math.cos(time/2)*10;
        //this.playerCamera.position.y = Math.cos(time)*5 + 6;
        //this.playerCamera.position.z = Math.sin(time/2)*10;
        //
        //this.playerCamera.setTarget(new BABYLON.Vector3(0,0,0));
    }

    /**
     * Выставить режим отобращения для типа элементов
     * @param typeId
     * @param visibility
     */
    setVisibilityOfType(typeId, visibility) {
        let typedElements = _.filter(this.elements, {type: {_id: typeId}});
        _.each(typedElements, (element) => {
            element.setVisibility(visibility);
        });
    }

    /**
     * Выставить режим отображения фигур
     * @param mode
     */
    setViewMode(mode) {
        switch (mode) {
            case 1: //Тела
                _.each(this.elements, (element) => {
                    let sourceMesh = element.mesh.sourceMesh || element.mesh;
                    let mesh = element.mesh;

                    sourceMesh.material.fillMode = 3;
                    mesh.material.fillMode = 3;
                    mesh.disableEdgesRendering();
                });
                break;
            case 2: //Тела с гранями
                _.each(this.elements, (element) => {
                    let sourceMesh = element.mesh.sourceMesh || element.mesh;
                    let mesh = element.mesh;

                    sourceMesh.material.fillMode = 3;
                    mesh.material.fillMode = 3;
                    mesh.enableEdgesRendering();
                    mesh.edgesWidth = 3.0;
                    mesh.edgesColor = new BABYLON.Color4(0, 0, 0, 1);
                });
                break;
            case 3: //Только грани
                _.each(this.elements, (element) => {
                    let sourceMesh = element.mesh.sourceMesh || element.mesh;
                    let mesh = element.mesh;

                    sourceMesh.material.fillMode = 3;
                    mesh.material.fillMode = 2;
                    mesh.enableEdgesRendering();
                    mesh.edgesWidth = 3.0;
                    mesh.edgesColor = new BABYLON.Color4(1, 1, 1, 0.8);
                });
                break;
            case 4: //Отладочные грани
                _.each(this.elements, (element) => {
                    let sourceMesh = element.mesh.sourceMesh || element.mesh;
                    let mesh = element.mesh;

                    sourceMesh.material.fillMode = 3;
                    mesh.material.fillMode = 1;
                    mesh.disableEdgesRendering();
                });
                break;
        }
    }

    /**
     * Выставить режим редактирования
     * @param mode
     */
    setControlMode(mode) {
        this.control.setMode(mode)
    }

    /**
     * Добавить элемент на карту
     * @param elementType
     */
    appendElement(elementType) {

        //Если мы уже в режиме добавления
        if (this.control.mode === CONTROL_MODES.APPEND) {
            //Убираем текущий элемент для дополнения
            this.control.currentElement.remove();
        }

        this.setControlMode(CONTROL_MODES.APPEND);

        let newElementData = {
            _id: 4,
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

        this.control.setCurrentElement(appendingElement);
    }
}
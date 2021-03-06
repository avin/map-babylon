import SceneWithElements from '../SceneWithElements'

import PlayerCamera from './cameras/PlayerCamera';
import MiniMapCamera from './cameras/MiniMapCamera';
import MainLight from './lights/MainLight';
import CameraLight from './lights/CameraLight';

//import UndoStack from './UndoStack';
import Control from '../../control/Control';

import {CONTROL_MODES} from '../../../constants'
import options from '../../../options';

//Импорт данных
import elementCatalog from '../../../data/element_catalog.json'

export default class extends SceneWithElements {

    constructor(engine) {
        super(engine);

        //Персональное имя сцены
        this.name = 'map';

        ////Добавить в каталог тестовые элементы для нагрузки
        //_.each(_.range(10, 100), (keyX) => {
        //    _.each(_.range(10, 100), (keyZ) => {
        //        elementCatalog.push({
        //            "_id": keyX * 1000 + keyZ,
        //            "type_id": 3,
        //            "properties": [],
        //            "parent": 1,
        //            "location": {
        //                "position": {
        //                    "x": keyX * 3,
        //                    "y": 0,
        //                    "z": keyZ * 3
        //                },
        //                "rotation": {
        //                    "x": 0,
        //                    "y": 0,
        //                    "z": 0
        //                }
        //            },
        //            "custom_model": false,
        //            "history": [],
        //            "states": []
        //        });
        //    })
        //});

        //Каталог элементов
        this.elementCatalog = _.keyBy(elementCatalog, '_id');

        if (options.babylonDebug) {
            this.showDebug();
        }

        //Определения стека отмены действий
        //this.undoStack = new UndoStack(this);

        this._init();
    }

    _init() {
        //Цвет фона
        this.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);

        this.optimizeFPS();

        this._initCameras();
        this._initLights();
        this._initControl();

        //Загружаем 3д модели типов
        this.loadTypeModels();

        this.loader.onFinish = () => {

            this.executeWhenReady(() => {
                this.renderer.setActiveScene(this.name);
            });

            this._initContent();

        };

        this.loader.load();
    }

    /**
     * Инициализация камер
     * @private
     */
    _initCameras() {
        //Главная камера
        let playerCameraOptions = {};
        this.playerCamera = new PlayerCamera('PlayerCamera', new BABYLON.Vector3(0.0, 0.0, 0.0), this, playerCameraOptions);
        this.activeCameras.push(this.playerCamera);

        //Привязываем управление к камере
        this.playerCamera.attachControl(this.getEngine().getRenderingCanvas(), false);
        console.log(this.playerCamera);

        //Через эту камеру будут производиться действия с элементами
        this.cameraToUseForPointers = this.playerCamera;

        //Мини камера
        //this.miniMapCamera = new MiniMapCamera();
    }

    /**
     * Инициализация светильников
     * @private
     */
    _initLights() {
        let mainLightOptions = {};
        this.mainLight = new MainLight('MainLight', new BABYLON.Vector3(-1, -1, 1), this, mainLightOptions);

        let cameraLightOptions = {};
        this.cameraLight = new CameraLight('cameraLight', new BABYLON.Vector3(1, 10, 1), this, cameraLightOptions);
    }

    /**
     * Инициализация управления
     * @private
     */
    _initControl() {
        this.control = new Control(this);
    }

    /**
     * Инициализация содержимого сцены
     * @private
     */
    _initContent() {

        //Подгружаем элементы из базы
        fetch(`/map/data`)
            .then((response) => response.json())
            .then((response) => {
                if (response.data) {
                    let data = _.keyBy(response.data, '_id');
                    this.elementCatalog = Object.assign(this.elementCatalog, data);

                    console.log(this.elementCatalog);

                    //Расставляем все элементы из базы элементов
                    _.each(this.elementCatalog, (elementData) => {
                        this.elementDispatcher.createElement(elementData);
                    });
                }
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

        ////Вращающаяся вокруг точки камера
        //this.playerCamera.position.x = Math.cos(time/2)*10;
        //this.playerCamera.position.y = Math.cos(time)*5 + 6;
        //this.playerCamera.position.z = Math.sin(time/2)*10;
        //this.playerCamera.setTarget(new BABYLON.Vector3(0,0,0));
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
    _appendSingleElement(elementType) {
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

        this.control.setCurrentElement(appendingElement);

        return appendingElement;
    }

    /**
     * Добавить комплексный элемент
     * @param elementType
     * @private
     */
    _appendComplexElement(elementType) {
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
            if (part.parent !== undefined) {
                let parentElement = parts[part.parent];
                appendingElement.setParent(parentElement);

                appendingElement.mesh.position = new BABYLON.Vector3(part.position.x, part.position.y, part.position.z);
            }

            parts.push(appendingElement);
        });

        //Первый элемент в стеке комплексного элемента всегда является родительским
        this.control.setCurrentElement(parts[0]);
    }

}
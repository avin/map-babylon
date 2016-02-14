import _ from 'lodash'

import playerCamera from './scene/playerCamera';
import miniMapCamera from './scene/miniMapCamera';
import mainLight from './scene/mainLight';
import cameraLight from './scene/cameraLight';
import filter from './scene/filter';
import Control from './Control';
import UndoStack from './UndoStack';


import Element from './models/Element'

import typeCatalog from '../data/type_catalog.json'
import elementCatalog from '../data/element_catalog.json'


export default class {

    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);

        this.engine = new BABYLON.Engine(this.canvas, true);

        // Contains all loaded assets
        this.models = [];

        // The state scene
        this.scene = null;

        // Control object
        this.control = null;

        this.typeCatalog = _.keyBy(typeCatalog, '_id');
        this.elementCatalog = _.keyBy(elementCatalog, '_id');

        this.elements = [];

        //Определения стека отмены действий
        this.undoStack = new UndoStack(this);

        this.time = 0.0;

        // Resize window event
        window.addEventListener("resize", () => {
            this.engine.resize();
        });


        this._init();
    }

    _init() {

        this._initScene();

        // The loader
        let loader = new BABYLON.AssetsManager(this.scene);

        //Загружаем все типовые модели из каталога
        _.each(this.typeCatalog, (type) => {
            //Если у типа есть модель
            let modelName = _.get(type, 'default_model');
            if (modelName) {
                let meshTask = loader.addMeshTask(modelName, "", "./assets/models/", `${modelName}.obj`);
                meshTask.onSuccess = (t) => {
                    //Добавляем модель в единый массив
                    this.models[modelName] = BABYLON.Mesh.MergeMeshes(t.loadedMeshes);
                    //Уменьшаем размер исходной фигуры до нулевого состояния
                    this.models[modelName].scaling = new BABYLON.Vector3(0, 0, 0);
                    //this.models[modelName].setEnabled(false);
                    this.models[modelName].material = new BABYLON.StandardMaterial('material', this.scene);
                };
            }
        });


        loader.onFinish = () => {

            this.scene.executeWhenReady(() => {

                this.engine.runRenderLoop(() => {
                    this.scene.render();
                });

            });

            this._initContent();

        };

        loader.load();
    }

    /**
     * Определяем сцену и узловые элементы сцены
     * @private
     */
    _initScene() {
        this.scene = new BABYLON.Scene(this.engine);

        //this.scene.debugLayer.show();

        BABYLON.SceneOptimizer.OptimizeAsync(this.scene, BABYLON.SceneOptimizerOptions.ModerateDegradationAllowed(50),
            () => {
                console.log('Optimized ModerateDegradation')
            },
            () => {
                BABYLON.SceneOptimizer.OptimizeAsync(this.scene, BABYLON.SceneOptimizerOptions.HighDegradationAllowed(40),
                    () => {
                        console.log('Optimized by HighDegradation')
                    },
                    () => {
                        console.log('Bad FPS!!!');
                    });
            });

        this.playerCamera = playerCamera.create(this, {});
        this.miniMapCamera = miniMapCamera.create(this, {});
        this.mainLight = mainLight.create(this, {});
        this.cameraLight = cameraLight.create(this, this.playerCamera, {});

        this.control = new Control(this);
    }

    /**
     * Инициализация содержимого карты
     * @private
     */
    _initContent() {

        //Расставляем все элементы из базы элементов
        _.each(this.elementCatalog, (elementData) => {
            this.elements.push(new Element(this, elementData));
        });

        this.scene.beforeRender = () => {
            let delta = this.engine.getDeltaTime() / 1000.0;
            this.time += delta;

            this._update(delta, this.time);
        };
    }

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

    showElementsByTypeId(typeId) {
        let typedElements = _.filter(this.elements, {type: {_id: typeId}});
        _.each(typedElements, (element) => {
            element.show();
        });
    }

    hideElementsByTypeId(typeId) {
        let typedElements = _.filter(this.elements, {type: {_id: typeId}});
        _.each(typedElements, (element) => {
            element.hide();
        });
    }

    /**
     * Включить уплавление
     */
    enableControl() {
        this.control.enableCameraControl();
    }

    /**
     * Отключить управление
     */
    disableControl() {
        this.control.disableCameraControl();
    }

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

    setControlMode(mode) {
        this.control.setMode(mode)
    }
}
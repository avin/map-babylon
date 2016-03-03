import {VIEW_MODES} from '../../constants';
import ElementDispatcher from './../elements/ElementDispatcher';

//Данные
import typeCatalog from '../../data/type_catalog.json'

export default class extends BABYLON.Scene {

    constructor(engine) {
        super(engine);

        this.renderer = engine.renderer;

        //Загруженные модели
        this.models = [];

        //Объект управления
        this.control = null;

        //Каталог типов элементов
        this.typeCatalog = _.keyBy(typeCatalog, '_id');

        //Каталог загружаемых моделей типов (для создания из них инстансов)
        this.models = [];

        //Диспетчер элементов
        this.elementDispatcher = new ElementDispatcher(this);

        //Массив элементов на сцене
        this.elements = [];

        //Режим просмотра фигур
        this.viewMode = VIEW_MODES.CLASSIC;

        //Загрузчик ресурсов
        this.loader = new BABYLON.AssetsManager(this);

        //Внутренее время сцены
        this.time = 0.0;
    }

    /**
     * Отключить управление камеры
     */
    disableControl() {
        this.activeCamera.detachControl(this.getEngine().getRenderingCanvas());
    }

    /**
     * Включить управление камеры
     */
    enableControl() {
        this.activeCamera.attachControl(this.getEngine().getRenderingCanvas(), false);
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
        _.each(this.elements, (element) => {
            element.setViewMode(mode);
        });
    }

    /**
     * Выставить режим редактирования
     * @param mode
     */
    setControlMode(mode) {
        this.control.setMode(mode)
    }

    /**
     * Оптимизация ФПС
     */
    optimizeFPS() {
        BABYLON.SceneOptimizer.OptimizeAsync(this, BABYLON.SceneOptimizerOptions.ModerateDegradationAllowed(50),
            () => {
                console.log('Optimized ModerateDegradation');
            },
            () => {
                BABYLON.SceneOptimizer.OptimizeAsync(this, BABYLON.SceneOptimizerOptions.HighDegradationAllowed(40),
                    () => {
                        console.log('Optimized by HighDegradation');
                    },
                    () => {
                        console.log('Bad FPS!!!');
                    });
            });
    }

    /**
     * Показать дебаг-панель BABYLON
     */
    showDebug(){
        this.debugLayer.show();
    }

    /**
     * Спрятать дебаг-панель BABYLON
     */
    hideDebug(){
        this.debugLayer.hide();
    }

    /**
     * Загружаем все 3d модели из каталога типов
     */
    loadTypeModels(){
        _.each(this.typeCatalog, (type) => {
            //Если у типа есть модель
            let modelName = _.get(type, 'default_model');
            if (modelName) {
                let meshTask = this.loader.addMeshTask(modelName, '', './assets/models/', `${modelName}.obj`);
                meshTask.onSuccess = (loaderTask) => {
                    //Добавляем модель в единый массив
                    this.models[modelName] = BABYLON.Mesh.MergeMeshes(loaderTask.loadedMeshes);
                    //Уменьшаем размер исходной фигуры до нулевого состояния
                    this.models[modelName].scaling = new BABYLON.Vector3(0, 0, 0);
                    this.models[modelName].material = new BABYLON.StandardMaterial('material', this);
                };
            }
        });
    }
}
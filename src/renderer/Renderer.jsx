//Данные
import typeCatalog from '../data/type_catalog.json'
import elementCatalog from '../data/element_catalog.json'

//Сцены
import TypeEditorScene from './scenes/typeEditor/TypeEditorScene';
import MapScene from './scenes/map/MapScene';

export default class {

    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.engine.renderer = this;

        //Сцены
        this.scenes = {};
        this.scenes.map = new MapScene(this.engine);
        this.scenes.typeEditor = new TypeEditorScene(this.engine);

        this.activeScene = null;

        //Событие изменения размера канваса
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    /**
     * Запуск рендерлупа для сцены
     * @param scene
     * @private
     */
    _runRenderLoop(scene){
        //Останавливаем рендер-луп для всех сцен
        this.engine.stopRenderLoop();

        //Включаем рендер-луп для заданной сцены
        if (scene){
            this.engine.runRenderLoop(() => {
                scene.render();
            });
        }
    }

    /**
     * Назначение активной сцены
     * @param sceneName
     */
    setActiveScene(sceneName){
        //Сначала отключаем управление всеми сценами
        _.each(this.scenes, (scene) => {
            scene.disableControl();
        });

        //Вешаем управление на сцену и запускаем её рендер-луп
        if (this.scenes[sceneName]){
            this.activeScene = this.scenes[sceneName];
            this.activeScene.enableControl();
            this._runRenderLoop(this.activeScene);
        }

        //Показываем соответсвющие сцене ui-компоненты
        switch(sceneName){
            case 'map':{
                $('#type-editor-control').hide();
                $('#mode-buttons').show();
                $('#catalog').show();
                break;
            }
            case 'typeEditor':{
                $('#type-editor-control').show();
                $('#mode-buttons').show();
                $('#catalog').show();
                break;
            }
        }
    }
}
//Данные
import typeCatalog from '../data/type_catalog.json'
import elementCatalog from '../data/element_catalog.json'

//Сцены
import ComplexEditorScene from './scenes/complexEditor/ComplexEditorScene';
import MapScene from './scenes/map/MapScene';

export default class {

    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.engine.renderer = this;

        //Сцены
        this.scenes = {
            map: new MapScene(this.engine),
            complexEditor: new ComplexEditorScene(this.engine),
        };

        this.activeScene = null;

        //Событие изменения размера канваса
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    /**
     * Запуск рендерлупа для сцены
     * @param scene
     * @private
     */
    _runRenderLoop(scene){
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
        if (this.scenes[sceneName]){
            this.activeScene = this.scenes[sceneName];
            this._runRenderLoop(this.activeScene);
        }
    }
}
import Ground from './Special/Ground'
import Sky from './Special/Sky'

export default class {

    constructor(Map, element) {
        this.Map = Map;
        this._id = element._id;
        this.data = element;
        this.type = Map.typeCatalog[this.data.type_id];

        this.mesh = null; //Фигура элемента
        this.core = null; //Объект описывающий логику элемента

        this.history = [];

        this._init();
    }

    _init() {
        switch (this.type.kind){
            case 'special':
                switch (this.type.code_class){
                    case 'sky':
                        this.core = new Sky(this.Map);
                        this.mesh = this.core.mesh;
                        break;

                    case 'ground':
                        this.core = new Ground(this.Map);
                        this.mesh = this.core.mesh;
                        break;
                }
                break;

            case 'figure':
                if (this.data.custom_model){
                    //Если у элемента индивидуальная модель
                    //TODO
                } else {
                    //Иначе используем модель типа
                    if (this.type.default_model){
                        //Только если модель для данного типа назначена
                        let elementMesh = this.Map.models[this.type.default_model].createInstance(this._id);
                        elementMesh.scaling = new BABYLON.Vector3(1, 1, 1);

                        let elementPosition = this.data.location.position;
                        elementMesh.position = new BABYLON.Vector3(elementPosition.x, elementPosition.y, elementPosition.z);
                        this.mesh = elementMesh;
                    }
                }
                break;

            case 'line':
                //TODO
                break;
        }

        //Оставляем в mesh-e сслыку на родительский объект
        if (this.mesh){
            this.mesh.element = this;
        }
    }

    /**
     * Подсветить элемент
     */
    enableHighlight(highlightRelated = false){
        this.mesh.showBoundingBox = true;
        //Если подсвечивать родственные элементы
        if (highlightRelated){

            //Обходим элементы системы в поисках потомков
            _.each(this.Map.elements, (element) => {
                if (_.eq(element.parent, this)){
                    //И подсвечиваем их и их потомков
                    element.enableHighlight(true);
                }
            })
        }
    }

    /**
     * Убрать подсветку
     */
    disableHighlight(highlightRelated = false){
        //Если подсвечены родственные элементе - обходим все элементы системы
        if (highlightRelated){
            _.each(this.Map.elements, (element) => {
                element.disableHighlight();
            });
        } else {
            this.mesh.showBoundingBox = false;
        }
    }

    show(){
        if (this.mesh.sourceMesh){
            this.mesh.sourceMesh.visibility = 1;
        } else {
            this.mesh.visibility = 1;
        }
    }

    hide(){
        if (this.mesh.sourceMesh){
            this.mesh.sourceMesh.visibility = 0;
        } else {
            this.mesh.visibility = 0;
        }
    }

    /**
     * Назначить родительский элемент
     * @param parentElement
     */
    setParent(parentElement){
        //Только если не пытаемся привязать старого родителя
        if (! _.eq(this.parent, parentElement)){

            //Отвязываем родителя если пытаемся привязаться к "специальному" элементу
            if (parentElement.type.kind == 'special') {
                this.parent = null;
                this.mesh.parent = null;
                return;
            }

            this.parent = parentElement;
            this.mesh.parent = parentElement.mesh;
        }
    }

    /**
     * Проверка на родство во всём гендерном дереве
     * @param parentElement
     */
    isChildOf(parentElement){
        if (this.parent){
            if (_.eq(this.parent, parentElement)){
                return true;
            } else {
                return this.parent.isChildOf(parentElement);
            }
        }
    }

    /**
     * Удалить элемент
     */
    remove(){
        //TODO
    }

    update(delta, time){
        if (this.core){
            if (_.isFunction(this.core.update)){
                this.core.update(delta, time);
            }
        }
    }
}
import Ground from './Special/Ground'
import Sky from './Special/Sky'
import Figure from './Figure/Figure'
import Line from './Line/Line'

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
                        this.core = new Sky(this, {});
                        break;

                    case 'ground':
                        this.core = new Ground(this, {});
                        break;
                }
                break;

            case 'figure':
                this.core = new Figure(this);
                break;

            case 'line':
                this.core = new Line(this);
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
        //Только для обычных элементов
        if (!this.isSpecial()){
            this.core.enableHighlight(highlightRelated);
        }

    }

    /**
     * Убрать подсветку
     */
    disableHighlight(highlightRelated = false){
        //Только для обычных элементов
        if (!this.isSpecial()){
            this.core.disableHighlight(highlightRelated);
        }
    }

    /**
     * Показать фигуру элемента на карте
     */
    show(){
        if (this.mesh.sourceMesh){
            this.mesh.sourceMesh.visibility = 1;
        } else {
            this.mesh.visibility = 1;
        }
    }

    /**
     * Спрятать фигуру элемента на карте
     */
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

        //Удаляем саму фигуру элемента
        if (this.mesh){
            this.mesh.dispose();
        }

        //Убиваем всех потомков элемента
        _.each(this.Map.elements, (element) => {
            if (element){
                if (element.isChildOf(this)) {
                    element.remove();
                }
            }
        });

        //Убираем элемент из общей базы элементов
        _.remove(this.Map.elements, (element) => {
            return element === this;
        });
    }


    /**
     * Элемент является специальным элементом?
     * @returns {boolean}
     */
    isSpecial(){
        return this.getTypeKind() === 'special';
    }

    /**
     * Элемент является фигурой?
     * @returns {boolean}
     */
    isFigure(){
        return this.getTypeKind() === 'figure';
    }

    /**
     * Элемент является линией?
     * @returns {boolean}
     */
    isLine(){
        return this.getTypeKind() === 'line';
    }

    /**
     * Получить родительскую разновидность
     * @returns {*}
     */
    getType(){
        return this.type;
    }

    /**
     * Получить данные элемента
     * @returns {*}
     */
    getData(){
        return this.data;
    }

    /**
     * Получить разновидность родителского типа
     * @returns {*}
     */
    getTypeKind(){
        return this.type.kind;
    }

    /**
     * Может ли элемент быть смонтирован на указанном родителе
     * @param parentElement
     */
    canBeMountedOn(parentElement){
        if (parentElement){
            let parentType = parentElement.getType();
            let ruleMountIds = _.get(this.type, 'rules.mount', []);

            return _.includes(ruleMountIds, parentType._id);
        }
    }

    /**
     * Покадровое обновление элемента
     * @param delta
     * @param time
     */
    update(delta, time){
        //Если у элемента есть объект поведения
        if (this.core){
            if (_.isFunction(this.core.update)){
                this.core.update(delta, time);
            }
        }
    }
}
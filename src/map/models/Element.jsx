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
        this.mesh.dispose();

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
        return this.type.kind === 'special';
    }

    /**
     * Элемент является фигурой?
     * @returns {boolean}
     */
    isFigure(){
        return this.type.kind === 'figure';
    }

    /**
     * Элемент является линией?
     * @returns {boolean}
     */
    isLine(){
        return this.type.kind === 'line';
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
        return this.kind;
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
import {color} from '../../helpers'
import {VISIBILITY} from '../../constants'

export default class Abstract {

    constructor(scene, elementData) {
        if (new.target === Abstract) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }

        this.scene = scene;
        this.data = elementData;
        this._id = elementData._id;
        this.type = this.scene.typeCatalog[this.data.type_id];

        this.mesh = null; //Фигура элемента

        //Флаг подсветки элемента
        this.highlighted = false;

        this.history = [];
    }

    /**
     * Инициализация объекта
     * @private
     */
    _init() {
        //Выставить режим отображения фигуры по умолчанию
        this.setVisibilityDefault();

        //Оставляем в mesh-e сслыку на родительский объект
        if (this.mesh) {
            this.mesh.element = this;
        }
    }

    /**
     * Выставить режим отображения по умолчанию
     */
    setVisibilityDefault() {
        //По умолчанию элемент отображается нормально
        if (this.visibility === undefined){
            this.setVisibilityNormal();
        }
    }

    /**
     * Подсветить элемент
     */
    enableHighlight(highlightRelated = false) {
        this.highlighted = true;
    }

    /**
     * Убрать подсветку
     */
    disableHighlight(highlightRelated = false) {
        this.highlighted = false;
    }

    /**
     * Выставить режим отобращения элемента
     * @param visibility
     */
    setVisibility(visibility) {
        switch (visibility) {
            case VISIBILITY.NORMAL:
                this.setVisibilityNormal();
                break;
            case VISIBILITY.TRANSPARENT:
                this.setVisibilityTransparent();
                break;
            case VISIBILITY.HIDDEN:
                this.setVisibilityHidden();
                break;
        }
    }

    /**
     * Выставить нормальный режим отображения для элемента
     */
    setVisibilityNormal() {
        this.visibility = VISIBILITY.NORMAL;
    }

    /**
     * Выставить прозрачный режим отображения для элемента
     */
    setVisibilityTransparent() {
        this.visibility = VISIBILITY.TRANSPARENT;
    }

    /**
     * Выставить скрытый режим отображения для элемента
     */
    setVisibilityHidden() {
        this.visibility = VISIBILITY.HIDDEN;
    }

    /**
     * Назначить родительский элемент
     * @param parentElement
     */
    setParent(parentElement) {
        //Только если не пытаемся привязать старого родителя
        if (!_.eq(this.parent, parentElement)) {

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
    isChildOf(parentElement) {
        if (this.parent) {
            if (_.eq(this.parent, parentElement)) {
                return true;
            } else {
                return this.parent.isChildOf(parentElement);
            }
        }
    }

    /**
     * Удалить элемент
     */
    remove() {

        //Удаляем саму фигуру элемента
        if (this.mesh) {
            this.mesh.dispose();
        }

        //Убиваем всех потомков элемента
        _.each(this.scene.elements, (element) => {
            if (element) {
                if (element.isChildOf(this)) {
                    element.remove();
                }
            }
        });

        //Убираем элемент из общей базы элементов
        _.remove(this.scene.elements, (element) => {
            return element === this;
        });
    }

    /**
     * Элемент является специальным элементом?
     * @returns {boolean}
     */
    isSpecial() {
        return this.getTypeKind() === 'special';
    }

    /**
     * Элемент является фигурой?
     * @returns {boolean}
     */
    isFigure() {
        return this.getTypeKind() === 'figure';
    }

    /**
     * Элемент является линией?
     * @returns {boolean}
     */
    isLine() {
        return this.getTypeKind() === 'line';
    }

    /**
     * Получить родительскую разновидность
     * @returns {*}
     */
    getType() {
        return this.type;
    }

    /**
     * Получить данные элемента
     * @returns {*}
     */
    getData() {
        return this.data;
    }

    /**
     * Получить разновидность родителского типа
     * @returns {*}
     */
    getTypeKind() {
        return this.type.kind;
    }

    /**
     * Может ли элемент быть смонтирован на указанном родителе
     * @param parentElement
     */
    canBeMountedOn(parentElement) {
        if (parentElement) {
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
    update(delta, time) {
    }

    /**
     * Назначить фигуре материал
     * @returns {*|BABYLON.Color3.FromInts}
     */
    setMaterial(specialColor) {
        let typeStyleColor = specialColor ? specialColor : color.hexColorToBabylonColor3(_.get(this.getType(), 'style.color', '#FFFFFF'));

        if (this.mesh){
            //Если фигура является инстансом - работаем с исходной фигурой
            let mesh = this.mesh.sourceMesh ? this.mesh.sourceMesh : this.mesh;

            mesh.material = new BABYLON.StandardMaterial('material', this.scene);
            mesh.material.glossiness = 0.2;

            mesh.material.diffuseColor = typeStyleColor;
            mesh.material.specularColor = new BABYLON.Color4(0.3, 0.3, 0.3, 0.5);
            mesh.material.useGlossinessFromSpecularMapAlpha = true;
        }

        return typeStyleColor;
    }

    /**
     * Подкрасить как совместимый для монтирования
     */
    colorMountCompatible(){
        this.setMaterial(new BABYLON.Color3(0,1,0));
        this.setVisibility(this.visibility);
    }

    /**
     * Подкрасить как несовместимый для монтирования
     */
    colorMountIncompatible(){
        this.setMaterial(new BABYLON.Color3(1,1,1));
        this.setVisibility(this.visibility);
    }

    /**
     * Убрать подкрашивание
     */
    unColor(){
        this.setMaterial();
        this.setVisibility(this.visibility);
    }

}
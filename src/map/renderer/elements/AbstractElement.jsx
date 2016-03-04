import {color} from '../../../common/helpers'
import {VISIBILITY, VIEW_MODES} from '../../constants'

export default class Abstract {

    constructor(scene, elementData) {
        if (new.target === Abstract) {
            throw new TypeError('Cannot construct Abstract instances directly');
        }

        this.scene = scene;
        this.data = elementData;
        this._id = elementData._id;
        this.type = this.scene.typeCatalog[this.data.type_id];

        //Фигура элемента
        this.mesh = null;

        //Флаги состояний элемента
        this.flags = {
            //Флаг подсветки элемента
            highlighted: false,
            //Флаг возможности монтирования на элемент null - без флага, 1 - положительно, 0 - отрицательно
            mountCompatible: null,
        };

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
        if (this.visibility === undefined) {
            this.setVisibilityNormal();
        }
    }

    /**
     * Подсветить элемент
     */
    enableHighlight(highlightRelated = false) {
        this.flags.highlighted = true;
    }

    /**
     * Убрать подсветку
     */
    disableHighlight(highlightRelated = false) {
        this.flags.highlighted = false;
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

            //Отвязываем родителя если пытаемся привязаться к 'специальному' элементу
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
     * @param position - позиция точки монтирования
     */
    canBeMountedOn(parentElement, position) {
        if (parentElement) {
            let parentType = parentElement.getType();
            let ruleMountIds = _.get(this.type, 'rules.mount', []);

            //Если указана точка монтирования - дополняем правила в зависимости от уровня относительно земли
            if (position){
                if (position.y> 0){
                    ruleMountIds = _.concat(ruleMountIds, _.get(this.type, 'rules.mount_overground', []))
                } else {
                    ruleMountIds = _.concat(ruleMountIds, _.get(this.type, 'rules.mount_underground', []))
                }
            } else {
                ruleMountIds = _.concat(ruleMountIds, _.get(this.type, 'rules.mount_overground', []))
                ruleMountIds = _.concat(ruleMountIds, _.get(this.type, 'rules.mount_underground', []))
            }

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
     * Предопределение материалов для фигуры
     * @returns {*|BABYLON.Color3.FromInts}
     */
    initMaterials() {
        let typeStyleColor = color.hexColorToBabylonColor3(_.get(this.getType(), 'style.color', '#FFFFFF'));

        if (this.mesh) {
            //Если фигура является инстансом - работаем с исходной фигурой
            let mesh = this.mesh.sourceMesh ? this.mesh.sourceMesh : this.mesh;

            if(! mesh.materials){
                mesh.materials = {};
            }

            //определяем оригинальный материал
            if (! mesh.materials.original){
                mesh.materials.original = new BABYLON.StandardMaterial('material', this.scene);
                mesh.materials.original.glossiness = 0.2;

                mesh.materials.original.diffuseColor = typeStyleColor;
                mesh.materials.original.specularColor = new BABYLON.Color4(0.3, 0.3, 0.3, 0.5);
                mesh.materials.original.useGlossinessFromSpecularMapAlpha = true;
            }

            //определяем оригинальный материал c прозрачностью
            if (! mesh.materials.originalTransparent){
                mesh.materials.originalTransparent = new BABYLON.StandardMaterial('material', this.scene);
                mesh.materials.originalTransparent.glossiness = 0.2;

                mesh.materials.originalTransparent.diffuseColor = typeStyleColor;
                mesh.materials.originalTransparent.specularColor = new BABYLON.Color4(0.3, 0.3, 0.3, 0.5);
                mesh.materials.originalTransparent.useGlossinessFromSpecularMapAlpha = true;

                mesh.materials.originalTransparent.alpha = 0.3;
            }

            //определяем материал для подсветки возможности монтирования
            if (! mesh.materials.mountCompatible){
                mesh.materials.mountCompatible = new BABYLON.StandardMaterial('material', this.scene);
                mesh.materials.mountCompatible.glossiness = 0.2;

                mesh.materials.mountCompatible.diffuseColor = new BABYLON.Color3(0, 1, 0);
                mesh.materials.mountCompatible.specularColor = new BABYLON.Color4(0.3, 0.3, 0.3, 0.5);
                mesh.materials.mountCompatible.useGlossinessFromSpecularMapAlpha = true;
            }

            //определяем материал для подсветки возможности монтирования с прозрачностью
            if (! mesh.materials.mountCompatibleTransparent){
                mesh.materials.mountCompatibleTransparent = new BABYLON.StandardMaterial('material', this.scene);
                mesh.materials.mountCompatibleTransparent.glossiness = 0.2;

                mesh.materials.mountCompatibleTransparent.diffuseColor = new BABYLON.Color3(0, 1, 0);
                mesh.materials.mountCompatibleTransparent.specularColor = new BABYLON.Color4(0.3, 0.3, 0.3, 0.5);
                mesh.materials.mountCompatibleTransparent.useGlossinessFromSpecularMapAlpha = true;

                mesh.materials.mountCompatibleTransparent.alpha = 0.3;
            }

            //определяем материал для подсветки невозможности монтирования
            if (! mesh.materials.mountIncompatible){
                mesh.materials.mountIncompatible = new BABYLON.StandardMaterial('material', this.scene);
                mesh.materials.mountIncompatible.glossiness = 0.2;

                mesh.materials.mountIncompatible.diffuseColor = new BABYLON.Color3(1, 1, 1);
                mesh.materials.mountIncompatible.specularColor = new BABYLON.Color4(0.3, 0.3, 0.3, 0.5);
                mesh.materials.mountIncompatible.useGlossinessFromSpecularMapAlpha = true;
            }

            //определяем материал для подсветки невозможности монтирования с прозрачностью
            if (! mesh.materials.mountIncompatibleTransparent){
                mesh.materials.mountIncompatibleTransparent = new BABYLON.StandardMaterial('material', this.scene);
                mesh.materials.mountIncompatibleTransparent.glossiness = 0.2;

                mesh.materials.mountIncompatibleTransparent.diffuseColor = new BABYLON.Color3(1, 1, 1);
                mesh.materials.mountIncompatibleTransparent.specularColor = new BABYLON.Color4(0.3, 0.3, 0.3, 0.5);
                mesh.materials.mountIncompatibleTransparent.useGlossinessFromSpecularMapAlpha = true;

                mesh.materials.mountIncompatibleTransparent.alpha = 0.3;
            }
        }
    }

    setViewMode(mode) {
        if (this.mesh){
            switch (mode) {
                case VIEW_MODES.CLASSIC:
                {

                    let mesh = this.mesh.sourceMesh || this.mesh;

                    if (mesh.viewMode !== VIEW_MODES.CLASSIC){
                        //mesh.m
                    }

                    mesh.material.fillMode = 3;
                    mesh.disableEdgesRendering();

                    mesh.viewMode = VIEW_MODES.CLASSIC;

                    break;
                }
                case VIEW_MODES.CLASSIC_WITH_EDGES:
                {

                    let sourceMesh = this.mesh.sourceMesh || this.mesh;
                    let mesh = this.mesh;

                    //sourceMesh.material.fillMode = 3;
                    //mesh.material.fillMode = 3;
                    mesh.enableEdgesRendering();
                    mesh.edgesWidth = 3.0;
                    mesh.edgesColor = new BABYLON.Color4(0, 0, 0, 1);

                    break;
                }
                case VIEW_MODES.EDGES:
                {

                    let sourceMesh = this.mesh.sourceMesh || this.mesh;
                    let mesh = this.mesh;

                    //sourceMesh.material.fillMode = 3;
                    //mesh.material.fillMode = 2;
                    mesh.enableEdgesRendering();
                    mesh.edgesWidth = 3.0;
                    mesh.edgesColor = new BABYLON.Color4(1, 1, 1, 0.8);

                    break;
                }
                case VIEW_MODES.DEBUG:
                {

                    let sourceMesh = this.mesh.sourceMesh || this.mesh;
                    let mesh = this.mesh;

                    //sourceMesh.material.fillMode = 3;
                    //mesh.material.fillMode = 1;
                    mesh.disableEdgesRendering();

                    break;
                }
            }
        }
    }

    /**
     * Выставить дальность прорисовки фигуры
     * @param LODLevel
     */
    setLODLevel(LODLevel){
        if (this.mesh){
            if (this.mesh.sourceMesh){
                this.mesh.sourceMesh.addLODLevel(LODLevel, null);
            } else {
                this.mesh.addLODLevel(LODLevel, null);
            }
        }

        if(this.line){
            this.line.addLODLevel(LODLevel, null);
        }
    }

    /**
     * Подкрасить как совместимый для монтирования
     */
    colorMountCompatible() {
        this.flags.mountCompatible = 1;

        this.setVisibility(this.visibility);
    }

    /**
     * Подкрасить как несовместимый для монтирования
     */
    colorMountIncompatible() {
        this.flags.mountCompatible = 0;

        this.setVisibility(this.visibility);
    }

    /**
     * Убрать подкрашивание
     */
    unColor() {
        this.flags.mountCompatible = null;

        this.setVisibility(this.visibility);
    }

}

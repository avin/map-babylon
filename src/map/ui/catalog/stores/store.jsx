import Reflux from 'reflux';
import React from 'react';
import catalogActions from '../actions/actions'
import typeCatalog from '../../../data/type_catalog.json'
import {VISIBILITY} from '../../../constants'

export default Reflux.createStore({
    listenables: [catalogActions],
    /**
     * Поиск элемента
     * @param searchValue
     */
    onSearch(searchValue){
        this.data.searchValue = searchValue;
        this.hideAllChildren();

        /**
         * Раскрываем все категории с вхождением поиска
         * @param parentId
         */
        let showChildren = (parentId) => {
            if (parentId){
                _.each(this.data.catalog, (catalogItem) => {
                    if (catalogItem._id === parentId){
                        catalogItem.show_children = true;
                        if (catalogItem.parent_id !== 0){
                            showChildren(catalogItem.parent_id)
                        }
                    }
                });
            }
        };

        //Находим элементы удовлетворяющие поиску
        _.each(this.data.catalog, (catalogItem) => {
            if ((new RegExp('(' + this.data.searchValue + ')', 'gi')).test(catalogItem.name)){
                showChildren(catalogItem.parent_id)
            }
        });

        this.trigger(this.data);
    },

    onAppendElement(type){
        window.app.renderer.activeScene.appendElement(type);
    },

    /**
     * Показать/Спрятать каталог
     */
    onToggleCatalog(){
        this.updateOptions({showCatalog: !this.data.options.showCatalog})
    },

    /**
     * Выставить режим отобращения для типа элементов
     * @param catalogItemId
     * @param visibility
     */
    onSetVisibility(catalogItemId, visibility){
        window.app.renderer.activeScene.setVisibilityOfType(catalogItemId, visibility);
        this.updateCatalogItem(catalogItemId, {visibility: visibility})
    },

    /**
     * Спрятать/показать потомков элемента каталога
     * @param catalogItemId
     */
    onToggleShowChildren(catalogItemId){
        let catalogItem = _.find(this.data.catalog, {_id: catalogItemId});
        this.updateCatalogItem(catalogItemId, {show_children: !catalogItem.show_children})
    },

    /**
     * Свернуть всех потомков
     */
    hideAllChildren(){
        _.each(this.data.catalog, (catalogItem) => {
            catalogItem.show_children = false;
        })
    },

    /**
     * Обновить содержимое элемента каталога
     * @param catalogItemId
     * @param catalogItemData
     */
    updateCatalogItem(catalogItemId, catalogItemData){
        let typeItem = _.find(this.data.catalog, {_id: catalogItemId});
        _.assignIn(typeItem, catalogItemData);
        this.trigger(this.data);
    },

    /**
     * Обновить весь каталог
     * @param newCatalogData
     */
    updateCatalog(newCatalogData){
        if (newCatalogData){
            this.data.options = {...this.data.catalog, newCatalogData};
        }
        this.trigger(this.data);
    },

    /**
     * Обновить настройки
     * @param newOptionsData
     */
    updateOptions(newOptionsData){
        if (newOptionsData){
            this.data.options = {...this.data.options, ...newOptionsData};
        }
        this.trigger(this.data);
    },

    /**
     * Инициализация исходных значений
     * @returns {{catalog, searchValue: string, options: {showCatalog: boolean}}|*}
     */
    getInitialState: function () {
        //Присваиваем всем типам тип отображения по умолчанию
        _.each(typeCatalog, (type) => {
            type.visibility = type.visibility || VISIBILITY.NORMAL;
        });

        this.data = {
            catalog: typeCatalog,
            searchValue: '',
            options: {
                showCatalog: true,
            },
        };
        return this.data;
    }
});
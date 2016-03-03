import Reflux from 'reflux';
import React from 'react';
import ReactDOM from 'react-dom';
import Catalog from './components/Catalog';
import catalogActions from './actions/actions';

export default class {

    constructor(catalogDomId) {
        this.dom = document.getElementById(catalogDomId);

        //Добавляем все reflux экшны в текущий класс
        _.each(catalogActions, (action, actionName) => {
            this[actionName] = action;
        });

        this._initDom();
    }

    _initDom(){
        ReactDOM.render(
            <Catalog />,
            this.dom
        );
    }

}
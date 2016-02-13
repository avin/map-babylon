import Reflux from 'reflux';
import React from 'react';
import ReactDOM from 'react-dom';
import UiBox from './components/UiBox';
import uiBoxActions from './actions/uiBoxActions';

export default class {

    constructor(UiBoxDomId) {
        this.dom = document.getElementById(UiBoxDomId);

        //Добавляем все reflux экшны в текущий класс
        _.each(uiBoxActions, (action, actionName) => {
            this[actionName] = action;
        });

        this._initDom();
    }

    _initDom(){
        ReactDOM.render(
            <UiBox />,
            this.dom
        );
    }

}
import Reflux from 'reflux';
import React from 'react';
import ReactDOM from 'react-dom';

import store from './stores/store';
import actions from './actions/actions';
import Control from './components/Control';

export default class {

    constructor(ModeButtonsDomId) {
        this.dom = document.getElementById(ModeButtonsDomId);

        //Добавляем все reflux экшны в текущий класс
        _.each(actions, (action, actionName) => {
            this[actionName] = action;
        });

        this._initDom();
    }

    _initDom(){
        ReactDOM.render(
            <Control />,
            this.dom
        );
    }

}
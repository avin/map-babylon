import Reflux from 'reflux';
import React from 'react';
import ReactDOM from 'react-dom';

import mapUiBoxStore from './stores/mapUiBoxStore';
import mapUiBoxActions from './actions/mapUiBoxActions';
import UiBox from './components/UiBox';

export default class {

    constructor(MapUiBoxDomId) {
        this.dom = document.getElementById(MapUiBoxDomId);

        //Добавляем все reflux экшны в текущий класс
        _.each(mapUiBoxActions, (action, actionName) => {
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
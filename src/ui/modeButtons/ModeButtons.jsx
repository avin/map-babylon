import Reflux from 'reflux';
import React from 'react';
import ReactDOM from 'react-dom';

import modeButtonsStore from './stores/modeButtonsStore';
import modeButtonsActions from './actions/modeButtonsActions';
import ButtonsBox from './components/ButtonsBox';

export default class {

    constructor(ModeButtonsDomId) {
        this.dom = document.getElementById(ModeButtonsDomId);

        //Добавляем все reflux экшны в текущий класс
        _.each(modeButtonsActions, (action, actionName) => {
            this[actionName] = action;
        });

        this._initDom();
    }

    _initDom(){
        ReactDOM.render(
            <ButtonsBox />,
            this.dom
        );
    }

}
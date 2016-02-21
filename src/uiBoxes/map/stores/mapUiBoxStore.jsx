import Reflux from 'reflux';
import React from 'react';
import {CONTROL_MODES, VIEW_MODES} from '../../../constants'
import mapUiBoxActions from '../actions/mapUiBoxActions'


export default Reflux.createStore({
    listenables: [mapUiBoxActions],

    /**
     * Выставит режим управления
     */
    onSetControlMode(controlMode, action=true){
        if (action){
            window.renderer.scene.map.setControlMode(controlMode);
        }

        this.updateData({controlMode: controlMode});
    },

    /**
     * Выставит режим отображения
     */
    onSetViewMode(viewMode, action=true){
        if (action){
            window.renderer.scene.map.setViewMode(viewMode);
        }

        this.updateData({viewMode: viewMode});
    },

    /**
     * Обновить данные
     * @param newData
     */
    updateData(newData){
        if (newData){
            this.data = _.assign(this.data, newData);
        }
        this.trigger(this.data);
    },

    /**
     * Инициализация исходных значений
     */
    getInitialState: function () {
        this.data = {
            controlMode: CONTROL_MODES.MOVE,
            viewMode: VIEW_MODES.CLASSIC,
        };
        return this.data;
    }
});
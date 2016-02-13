import Reflux from 'reflux';
import React from 'react';
import uiBoxActions from '../actions/uiBoxActions'

export default Reflux.createStore({
    listenables: [uiBoxActions],

    /**
     * Выставит режим управления
     */
    onSetControlMode(controlMode){
        window.app.map.setControlMode(controlMode);
        this.updateData({controlMode: controlMode});
    },

    /**
     * Выставит режим отображения
     */
    onSetViewMode(viewMode){
        window.app.map.setViewMode(viewMode);
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
            controlMode: 1,
            viewMode: 1,
        };
        return this.data;
    }
});
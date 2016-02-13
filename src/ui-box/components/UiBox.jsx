import React from 'react';
import Reflux from 'reflux';

import UiGroup  from './UiGroup';

import uiBoxActions from '../actions/uiBoxActions'
import uiBoxStore from '../stores/uiBoxStore'

export default React.createClass({
    mixins: [Reflux.connect(uiBoxStore, "data")],
    render(){

        let groupControlMode = [
            {
                name: 'Перемещение по осям',
                icon: 'icon_Cascade_Axis_40x.png',
                value: 1,
                action: uiBoxActions.setControlMode
            },
            {
                name: 'Вращение',
                icon: 'icon_rotateb_40x.png',
                value: 2,
                action: uiBoxActions.setControlMode
            },
            {
                name: 'Drag\'n\'Drop',
                icon: 'icon_BlueprintEditor_Components_40x.png',
                value: 3,
                action: uiBoxActions.setControlMode
            }
        ];

        let groupViewMode = [
            {
                name: 'Тела',
                icon: 'icon_box_40x.png',
                value: 1,
                action: uiBoxActions.setViewMode
            },
            {
                name: 'Тела с гранями',
                icon: 'icon_Mode_BSP_40x.png',
                value: 2,
                action: uiBoxActions.setViewMode
            },
            {
                name: 'Только грани',
                icon: 'icon_bspmode_40x.png',
                value: 3,
                action: uiBoxActions.setViewMode
            },
            {
                name: 'Отладочные грани',
                icon: 'icon_PhAT_NewBody_40x.png',
                value: 4,
                action: uiBoxActions.setViewMode
            }
        ];

        return (
            <div className="ui-box">
                <UiGroup data={groupControlMode} active={this.state.data.controlMode}/>
                <UiGroup data={groupViewMode} active={this.state.data.viewMode}/>
            </div>
        )
    }
});


import React from 'react';
import Reflux from 'reflux';
import {CONTROL_MODES, VIEW_MODES} from '../../../constants'
import UiGroup  from './UiGroup';

import mapUiBoxActions from '../actions/mapUiBoxActions'
import mapUiBoxStore from '../stores/mapUiBoxStore'

export default React.createClass({
    mixins: [Reflux.connect(mapUiBoxStore, "data")],
    render(){

        let groupControlMode = [
            {
                name: 'Перемещение по осям',
                icon: 'icon_Cascade_Axis_40x.png',
                value: CONTROL_MODES.MOVE,
                action: mapUiBoxStore.setControlMode
            },
            {
                name: 'Вращение',
                icon: 'icon_rotateb_40x.png',
                value: CONTROL_MODES.ROTATE,
                action: mapUiBoxStore.setControlMode
            },
            {
                name: 'Drag\'n\'Drop',
                icon: 'icon_BlueprintEditor_Components_40x.png',
                value: CONTROL_MODES.DRAG,
                action: mapUiBoxStore.setControlMode
            }
        ];

        let groupViewMode = [
            {
                name: 'Тела',
                icon: 'icon_box_40x.png',
                value: VIEW_MODES.CLASSIC,
                action: mapUiBoxStore.setViewMode
            },
            {
                name: 'Тела с гранями',
                icon: 'icon_Mode_BSP_40x.png',
                value: VIEW_MODES.CLASSIC_WITH_EDGES,
                action: mapUiBoxStore.setViewMode
            },
            {
                name: 'Только грани',
                icon: 'icon_bspmode_40x.png',
                value: VIEW_MODES.EDGES,
                action: mapUiBoxStore.setViewMode
            },
            {
                name: 'Отладочные грани',
                icon: 'icon_PhAT_NewBody_40x.png',
                value: VIEW_MODES.DEBUG,
                action: mapUiBoxStore.setViewMode
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


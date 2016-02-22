import React from 'react';
import Reflux from 'reflux';
import {CONTROL_MODES, VIEW_MODES} from '../../../constants'
import ButtonsGroup  from './ButtonsGroup';

import modeButtonsActions from '../actions/modeButtonsActions'
import modeButtonsStore from '../stores/modeButtonsStore'

export default React.createClass({
    mixins: [Reflux.connect(modeButtonsStore, 'data')],
    render(){

        let groupControlMode = [
            {
                name: 'Перемещение по осям',
                icon: 'icon_Cascade_Axis_40x.png',
                value: CONTROL_MODES.MOVE,
                action: modeButtonsActions['setControlMode']
            },
            {
                name: 'Вращение',
                icon: 'icon_rotateb_40x.png',
                value: CONTROL_MODES.ROTATE,
                action: modeButtonsActions['setControlMode']
            },
            {
                name: 'Drag\'n\'Drop',
                icon: 'icon_BlueprintEditor_Components_40x.png',
                value: CONTROL_MODES.DRAG,
                action: modeButtonsActions['setControlMode']
            }
        ];

        let groupViewMode = [
            {
                name: 'Тела',
                icon: 'icon_box_40x.png',
                value: VIEW_MODES.CLASSIC,
                action: modeButtonsActions['setViewMode']
            },
            {
                name: 'Тела с гранями',
                icon: 'icon_Mode_BSP_40x.png',
                value: VIEW_MODES.CLASSIC_WITH_EDGES,
                action: modeButtonsActions['setViewMode']
            },
            {
                name: 'Только грани',
                icon: 'icon_bspmode_40x.png',
                value: VIEW_MODES.EDGES,
                action: modeButtonsActions['setViewMode']
            },
            {
                name: 'Отладочные грани',
                icon: 'icon_PhAT_NewBody_40x.png',
                value: VIEW_MODES.DEBUG,
                action: modeButtonsActions['setViewMode']
            }
        ];

        return (
            <div className='ui-box'>
                <ButtonsGroup data={groupControlMode} active={this.state.data.controlMode}/>
                <ButtonsGroup data={groupViewMode} active={this.state.data.viewMode}/>
            </div>
        )
    }
});


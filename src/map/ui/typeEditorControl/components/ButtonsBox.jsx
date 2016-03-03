import React from 'react';
import Reflux from 'reflux';
import {CONTROL_MODES, VIEW_MODES} from '../../../constants'
import ButtonsGroup  from './ButtonsGroup';

import modeButtonsActions from '../actions/actions'
import modeButtonsStore from '../stores/store'

export default React.createClass({
    mixins: [Reflux.connect(modeButtonsStore, 'data')],
    render(){

        return (
            <div className='ui-box'>
                <ButtonsGroup />
            </div>
        )
    }
});


import React from 'react';
import Reflux from 'reflux';

import actions from '../actions/actions'
import store from '../stores/store'

export default React.createClass({
    mixins: [Reflux.connect(store, 'data')],
    render(){

        return (
            <div>CONTROL</div>
        )
    }
});


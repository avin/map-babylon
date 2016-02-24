import React from 'react';
import {VISIBILITY} from '../../../constants'
import catalogActions from '../actions/actions'

export default React.createClass({
    changeVisibility(){
        switch (this.props.item.visibility){
            case VISIBILITY.NORMAL:
                catalogActions.setVisibility(this.props.item._id, VISIBILITY.TRANSPARENT);
                break;
            case VISIBILITY.TRANSPARENT:
                catalogActions.setVisibility(this.props.item._id, VISIBILITY.HIDDEN);
                break;
            case VISIBILITY.HIDDEN:
                catalogActions.setVisibility(this.props.item._id, VISIBILITY.NORMAL);
                break;
        }
    },
    render(){
        let icon;
        switch (this.props.item.visibility){
            case VISIBILITY.NORMAL:
                icon = 'fa-circle text-success';
                break;
            case VISIBILITY.TRANSPARENT:
                icon = 'fa-dot-circle-o text-warning';
                break;
            case VISIBILITY.HIDDEN:
                icon = 'fa-circle-o text-muted';
                break;
        }
        return (
            <span onClick={this.changeVisibility}><i className={`fa ${icon}`} /></span>
        )
    }
});


import React from 'react';
import Reflux from 'reflux';

export default React.createClass({
    handleClickClose(){
        window.app.renderer.setActiveScene('map');
    },
    render(){
        return (
            <div className='btn-group' role='group'>
                <button className='btn btn-default' onClick={this.handleClickClose}>
                    Закрыть
                </button>
            </div>
        )
    }
});


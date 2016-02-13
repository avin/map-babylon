import React from 'react';
import catalogActions from '../actions/catalogActions'

export default React.createClass({
    handleClick(){
        catalogActions.toggleCatalog();
    },
    render(){
        let currentIcon = this.props.active ? 'fa-chevron-left' : 'fa-chevron-right';
        return (
            <div className="catalog-toggle" onClick={this.handleClick}>
                <span className={`fa ${currentIcon}`} />
            </div>
        )
    }
});


import React from 'react';
import Reflux from 'reflux';

export default React.createClass({

    render(){
        let buttons = _.map(this.props.data, (item, key) => {
            let active = (this.props.active === item.value);
            return (
                <button className={`btn ${active ? 'btn-warning' : 'btn-default'}`}
                        key={key} title={item.name} onClick={item.action.bind(this, item.value)}>

                    <img src={`./assets/icons/${item.icon}`} width='24px' height='24px'/>
                </button>
            )
        });
        return (
            <div className='btn-group' role='group'>
                {buttons}
            </div>
        )
    }
});


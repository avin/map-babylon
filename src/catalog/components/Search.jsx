import React from 'react';
import catalogActions from '../actions/catalogActions'

export default React.createClass({
    getInitialState: function() {
        return { value: this.props.value}
    },
    handleFocus(){
        window.app.map.disableControl();
    },
    handleBlur(){
        window.app.map.enableControl();
    },
    handleKeyPress(event){
        if (event.key === 'Enter') {
            catalogActions.search(this.state.value)
        }
    },
    onChange: function(event) {
        this.setState({ value: event.target.value }, function() {});
    },
    render(){
        return (
            <div className="catalog-search">
                <input type="text" className="form-control" placeholder="Найти..." value={this.state.value}
                       onFocus={this.handleFocus} onBlur={this.handleBlur} onKeyPress={this.handleKeyPress} onChange={this.onChange}/>
            </div>
        )
    }
});


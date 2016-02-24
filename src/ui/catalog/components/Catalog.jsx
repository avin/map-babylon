import React from 'react';
import Reflux from 'reflux';
import catalogActions from '../actions/actions'
import catalogStore from '../stores/store'

import Toggle from './Toggle'
import Content from './Content'
import Search from './Search'

export default React.createClass({
    mixins: [Reflux.connect(catalogStore, 'data')],
    render(){
        let style = {width: this.state.data.options.showCatalog ? 300 : 0};

        //Рендерим контент только есть панель видна
        let content;
        if (this.state.data.options.showCatalog){
            content = (
                <div>
                    <Search value={this.state.data.searchValue}/>
                    <Content catalog={this.state.data.catalog}
                             parentId={0} level={0}
                             searchValue={this.state.data.searchValue}/>
                </div>
            )
        }

        return (
            <div style={style}>
                <Toggle active={this.state.data.options.showCatalog} />
                {content}
            </div>
        )
    }
});


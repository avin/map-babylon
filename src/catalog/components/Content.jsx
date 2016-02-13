import React from 'react';
import catalogActions from '../actions/catalogActions'

import Toggle from './Toggle'
import Content from './Content'
import CatalogItem from './CatalogItem'

export default React.createClass({
    render(){
        let catalogItems = _.map(this.props.catalog, (catalogItem, key) => {
            let haveChildren = !!_.find(this.props.catalog, {parent_id: catalogItem._id});
            if (catalogItem.parent_id === this.props.parentId) {
                return (
                    <CatalogItem item={catalogItem} key={key}
                                 haveChildren={haveChildren} catalog={this.props.catalog}
                                 level={this.props.level} searchValue={this.props.searchValue}/>
                )
            }
        });

        let style = {backgroundColor: `rgba(0, 0, 0, ${this.props.level/50})`};
        return (
            <div className="catalog-content" style={style}>
                {catalogItems}
            </div>
        )
    }
});


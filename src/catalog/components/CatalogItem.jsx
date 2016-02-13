import React from 'react';
import catalogActions from '../actions/catalogActions'

import Toggle from './Toggle'
import Content from './Content'


export default React.createClass({
    toggleVisible(){
        catalogActions.toggleVisible(this.props.item._id)
    },
    handleShowChildren(){
        catalogActions.toggleShowChildren(this.props.item._id)
    },
    _highlightQuery: function(name, query) {
        var regex = new RegExp("(" + query + ")", "gi");
        return "<span>"+name.replace(regex, "<strong>$1</strong>")+"</span>";
    },
    render(){
        let addButton;
        if (this.props.item.create_enable) {
            addButton = (
                <button className="btn btn-xs btn-default">
                    <i className="fa fa-plus"/>
                </button>
            )
        }

        let isVisible = !this.props.item.is_hidden;

        let showChildren;
        if (this.props.haveChildren) {
            if (this.props.item.show_children){
                showChildren = (
                    <span><i className="fa fa-angle-down"/></span>
                )
            } else {
                showChildren = (
                    <span><i className="fa fa-angle-right"/></span>
                )
            }

        }

        let children;
        if (this.props.haveChildren && this.props.item.show_children){
            children = (
                <Content catalog={this.props.catalog} parentId={this.props.item._id}
                         level={this.props.level+1} searchValue={this.props.searchValue}/>
            )
        }

        return (
            <div>
                <div className="catalog-item row">
                    <div className="col-xs-1" onClick={this.handleShowChildren}>
                        {showChildren}
                    </div>

                    <div className="col-xs-8" onClick={this.handleShowChildren}>
                        <span dangerouslySetInnerHTML={{__html:this._highlightQuery(this.props.item.name, this.props.searchValue)}} />
                    </div>
                    <div className="col-xs-1">
                        {addButton}
                    </div>
                    <div className="col-xs-1">
                        <input type="checkbox" checked={isVisible} onChange={this.toggleVisible}/>
                    </div>
                </div>
                <div className="children">
                    {children}
                </div>
            </div>
        )
    }
});


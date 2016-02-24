import React from 'react';
import catalogActions from '../actions/actions'

import Toggle from './Toggle'
import Content from './Content'
import Visibility from './Visibility'

export default React.createClass({
    handleShowChildren(){
        catalogActions.toggleShowChildren(this.props.item._id)
    },
    _highlightQuery: function(name, query) {
        var regex = new RegExp('(' + query + ')', 'gi');
        return '<span>'+name.replace(regex, '<strong>$1</strong>')+'</span>';
    },
    handleAppendElement(){
        catalogActions.appendElement(this.props.item)
    },
    handleEditComplexElement(){
        window.app.renderer.setActiveScene('typeEditor');
    },
    render(){
        let addButton;
        if (this.props.item.create_enable) {
            addButton = (
                <button className='btn btn-xs btn-default' onClick={this.handleAppendElement}>
                    <i className='fa fa-plus'/>
                </button>
            )
        }

        let editButton;
        if (this.props.item.kind === 'complex') {
            editButton = (
                <button className='btn btn-xs btn-default btn-show-complex-editor' onClick={this.handleEditComplexElement}>
                    <i className='fa fa-pencil'/>
                </button>
            )
        }

        let isVisible = !_.get(this.props.item, 'is_hidden', false);

        let showChildren;
        if (this.props.haveChildren) {
            if (this.props.item.show_children){
                showChildren = (
                    <span><i className='fa fa-angle-down'/></span>
                )
            } else {
                showChildren = (
                    <span><i className='fa fa-angle-right'/></span>
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
                <div className='catalog-item row'>
                    <div className='col-xs-1' onClick={this.handleShowChildren}>
                        {showChildren}
                    </div>

                    <div className='col-xs-8' onClick={this.handleShowChildren}>
                        <span dangerouslySetInnerHTML={{__html:this._highlightQuery(this.props.item.name, this.props.searchValue)}} /> {editButton}
                    </div>
                    <div className='col-xs-1'>
                        {addButton}
                    </div>
                    <div className='col-xs-1'>
                        <Visibility item={this.props.item}/>
                    </div>
                </div>
                <div className='children'>
                    {children}
                </div>
            </div>
        )
    }
});


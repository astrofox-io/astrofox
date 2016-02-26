'use strict';

var React = require('react');
var MenuBarItem = require('./MenuBarItem.jsx');
var items = require('../../../conf/menu.json');

var MenuBar = React.createClass({
    getInitialState: function() {
        return {
            activeIndex: -1,
            items: items
        };
    },

    handleClick: function(index) {
        this.setActiveIndex((this.state.activeIndex === index) ? -1 : index);
    },

    handleMouseOver: function(index) {
        if (this.state.activeIndex > -1) {
            this.setActiveIndex(index);
        }
    },

    handleItemClick: function(action, checked) {
        this.setActiveIndex(-1);

        if (this.props.onMenuAction) {
            this.props.onMenuAction(action, checked);
        }
    },

    setActiveIndex: function(index) {
        this.setState({ activeIndex: index });
    },

    setCheckState: function(action, checked) {
        var items = this.state.items;

        items.forEach(function(barItem) {
            if (barItem.submenu) {
                barItem.submenu.forEach(function(menuItem) {
                    if (action === barItem.label + '/' + menuItem.label) {
                        menuItem.checked = checked;
                        this.setState(items);
                    }
                }, this);
            }
        }, this);
    },

    render: function() {
        var items = this.state.items.map(function(item, index) {
            return (
                <MenuBarItem
                    key={index}
                    label={item.label}
                    items={item.submenu}
                    active={this.state.activeIndex === index}
                    onClick={this.handleClick.bind(this, index)}
                    onMouseOver={this.handleMouseOver.bind(this, index)}
                    onItemClick={this.handleItemClick}
                />
            );
        }, this);

        return (
            <div className="menubar">
                <ul>{items}</ul>
            </div>
        );
    }
});

module.exports = MenuBar;
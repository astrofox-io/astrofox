'use strict';

var React = require('react');
var Menu = require('./Menu.jsx');

var MenuBarItem = React.createClass({
    handleClick: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.props.onClick();
    },

    handleMouseOver: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.props.onMouseOver();
    },

    handleItemClick: function(item) {
        var action = this.props.label + '/' + item.props.label;
        this.props.onItemClick(action, item.props.checked);
    },

    render: function() {
        var classes = 'menubar-text';

        if (this.props.active) {
            classes += ' menubar-text-active';
        }

        return (
            <li className="menubar-item">
                <div
                    className={classes}
                    onClick={this.handleClick}
                    onMouseOver={this.handleMouseOver}>
                    {this.props.label}
                </div>
                <Menu
                    items={this.props.items}
                    visible={this.props.active}
                    onItemClick={this.handleItemClick}
                />
            </li>
        );
    }
});

module.exports = MenuBarItem;
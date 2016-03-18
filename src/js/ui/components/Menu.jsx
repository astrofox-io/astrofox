'use strict';

var React = require('react');
var MenuItem = require('./MenuItem.jsx');

var Menu = React.createClass({
    getDefaultProps: function() {
        return {
            items: [],
            visible: false
        }
    },

    handleItemClick: function(item) {
        if (this.props.onItemClick) {
            this.props.onItemClick(item);
        }
    },

    render: function() {
        var style = { display: (this.props.visible) ? 'block' : 'none' };

        var items = this.props.items.map(function(item, index) {
            if (item.type == 'separator') {
                return <div key={index} className="menu-separator" />;
            }
            else if (item.label) {
                return (
                    <MenuItem
                        key={index}
                        label={item.label}
                        checked={item.checked}
                        separator={item.type == 'separator'}
                        onClick={this.handleItemClick}
                    />
                );
            }
        }, this);

        return (
            <ul className="menu" style={style}>
                {items}
            </ul>
        );
    }
});

module.exports = Menu;

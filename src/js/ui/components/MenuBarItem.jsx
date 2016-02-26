'use strict';

var React = require('react');
var MenuItem = require('./MenuItem.jsx');

var MenuBarItem = React.createClass({
    getInitialState: function() {
        return {
            showItems: false
        };
    },

    componentWillReceiveProps: function(props) {
        if (typeof props.active !== 'undefined') {
            this.setState({ showItems: props.active });
        }
    },

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
        var style = { display: (this.state.showItems) ? 'block' : 'none' },
            classes = 'menubar-text';

        if (this.props.active) {
            classes += ' menubar-text-active';
        }

        var items = this.props.items.map(function(item, index) {
            if (item.type == 'separator') {
                return <div key={'menuitem' + index} className="menu-separator" />;
            }
            else if (item.label) {
                return (
                    <MenuItem
                        key={'menuitem' + index}
                        label={item.label}
                        checked={item.checked}
                        separator={item.type == 'separator'}
                        onClick={this.handleItemClick}
                    />
                );
            }
        }, this);

        return (
            <li className="menubar-item">
                <div
                    className={classes}
                    onClick={this.handleClick}
                    onMouseOver={this.handleMouseOver}>
                    {this.props.label}
                </div>
                <ul
                    className="menu"
                    style={style}>
                    {items}
                </ul>
            </li>
        );
    }
});

module.exports = MenuBarItem;
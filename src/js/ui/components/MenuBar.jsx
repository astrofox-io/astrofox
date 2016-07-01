'use strict';

const React = require('react');
const MenuBarItem = require('./MenuBarItem.jsx');
const menuItemsConfig = require('../../../conf/menu.json');
const autoBind = require('../../util/autoBind.js');

class MenuBar extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            activeIndex: -1,
            items: menuItemsConfig
        };
    }

    handleClick(index) {
        this.setActiveIndex((this.state.activeIndex === index) ? -1 : index);
    }

    handleMouseOver(index) {
        if (this.state.activeIndex > -1) {
            this.setActiveIndex(index);
        }
    }

    handleMenuItemClick(action, checked) {
        this.setActiveIndex(-1);

        if (this.props.onMenuAction) {
            this.props.onMenuAction(action, checked);
        }
    }

    setActiveIndex(index) {
        if (this.state.activeIndex !== index) {
            this.setState({activeIndex: index});
        }
    }

    setCheckState(action, checked) {
        let items = this.state.items;

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
    }

    render() {
        let items = this.state.items.map(function(item, index) {
            return (
                <MenuBarItem
                    key={index}
                    label={item.label}
                    items={item.submenu}
                    active={this.state.activeIndex === index}
                    onClick={this.handleClick.bind(this, index)}
                    onMouseOver={this.handleMouseOver.bind(this, index)}
                    onMenuItemClick={this.handleMenuItemClick}
                />
            );
        }, this);

        return (
            <div id="menubar" className="menubar">
                <ul>{items}</ul>
            </div>
        );
    }
}

module.exports = MenuBar;
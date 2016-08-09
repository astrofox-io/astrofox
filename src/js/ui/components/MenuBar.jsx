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

    onClick(index) {
        this.setActiveIndex((this.state.activeIndex === index) ? -1 : index);
    }

    onMouseOver(index) {
        if (this.state.activeIndex > -1) {
            this.setActiveIndex(index);
        }
    }

    onMenuItemClick(action, checked) {
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

        items.forEach(barItem => {
            if (barItem.submenu) {
                barItem.submenu.forEach(menuItem => {
                    if (action === barItem.label + '/' + menuItem.label) {
                        menuItem.checked = checked;
                        this.setState(items);
                    }
                }, this);
            }
        }, this);
    }

    render() {
        let items = this.state.items.map((item, index) => {
            return (
                <MenuBarItem
                    key={index}
                    label={item.label}
                    items={item.submenu}
                    active={this.state.activeIndex === index}
                    onClick={this.onClick.bind(this, index)}
                    onMouseOver={this.onMouseOver.bind(this, index)}
                    onMenuItemClick={this.onMenuItemClick}
                />
            );
        }, this);

        return (
            <div id="menubar" className="menubar">
                {items}
            </div>
        );
    }
}

module.exports = MenuBar;
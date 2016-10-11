'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const MenuBarItem = require('./MenuBarItem.jsx');

class MenuBar extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            activeIndex: -1,
            items: props.items
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

    setCheckState(action) {
        let items = this.state.items;

        items.forEach(barItem => {
            if (barItem.submenu) {
                barItem.submenu.forEach(menuItem => {
                    if (action === barItem.label + '/' + menuItem.label) {
                        menuItem.checked = !menuItem.checked;
                        this.setState(items);
                    }
                });
            }
        });
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
        });

        return (
            <div id="menubar" className="menubar">
                {items}
            </div>
        );
    }
}

MenuBar.defaultProps = {
    items: {}
};

module.exports = MenuBar;
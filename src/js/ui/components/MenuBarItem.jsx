'use strict';

const React = require('react');
const Menu = require('./Menu.jsx');
const classNames = require('classnames');
const autoBind = require('../../util/autoBind.js');

class MenuBarItem extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    onClick(e) {
        e.stopPropagation();
        e.preventDefault();

        this.props.onClick();
    }

    onMouseOver(e) {
        e.stopPropagation();
        e.preventDefault();

        this.props.onMouseOver();
    }

    onMenuItemClick(item) {
        let action = this.props.label + '/' + item.label;
        
        this.props.onMenuItemClick(action, item.checked);
    }

    render() {
        return (
            <li className="menubar-item">
                <div
                    className={classNames('menubar-text', {'menubar-text-active': this.props.active})}
                    onClick={this.onClick}
                    onMouseOver={this.onMouseOver}>
                    {this.props.label}
                </div>
                <Menu
                    items={this.props.items}
                    visible={this.props.active}
                    onMenuItemClick={this.onMenuItemClick}
                />
            </li>
        );
    }
}

module.exports = MenuBarItem;
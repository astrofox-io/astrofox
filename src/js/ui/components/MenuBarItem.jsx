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

    handleClick(e) {
        e.stopPropagation();
        e.preventDefault();

        this.props.onClick();
    }

    handleMouseOver(e) {
        e.stopPropagation();
        e.preventDefault();

        this.props.onMouseOver();
    }

    handleItemClick(item) {
        let action = this.props.label + '/' + item.props.label;
        
        this.props.onItemClick(action, item.props.checked);
    }

    render() {
        return (
            <li className="menubar-item">
                <div
                    className={classNames({ 'menubar-text': true, 'menubar-text-active': this.props.active })}
                    onClick={this.handleClick}
                    onMouseOver={this.handleMouseOver}>
                    {this.props.label}
                </div>
                <Menu
                    items={this.props.items}
                    visible={this.props.active}
                    onMenuItemClick={this.handleItemClick}
                />
            </li>
        );
    }
}

module.exports = MenuBarItem;
import React from 'react';
import classNames from 'classnames';

import UIComponent from 'components/UIComponent';
import Menu from 'components/nav/Menu';

export default class MenuBarItem extends UIComponent {
    constructor(props) {
        super(props);
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
        this.props.onMenuItemClick(item.action, item.checked);
    }

    render() {
        return (
            <div className="item">
                <div
                    className={classNames('text', {'active': this.props.active})}
                    onClick={this.onClick}
                    onMouseOver={this.onMouseOver}>
                    {this.props.label}
                </div>
                <Menu
                    items={this.props.items}
                    visible={this.props.active}
                    onMenuItemClick={this.onMenuItemClick}
                />
            </div>
        );
    }
}
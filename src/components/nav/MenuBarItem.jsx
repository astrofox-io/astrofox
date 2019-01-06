import React, { Component } from 'react';
import classNames from 'classnames';
import Menu from 'components/nav/Menu';
import styles from './Menu.less';

export default class MenuBarItem extends Component {
    onClick = (e) => {
        e.stopPropagation();
        e.preventDefault();

        this.props.onClick();
    }

    handleMouseOver = (e) => {
        e.stopPropagation();
        e.preventDefault();

        this.props.onMouseOver();
    }

    handleMenuItemClick = (item) => {
        this.props.onMenuItemClick(item.action, item.checked);
    }

    render() {
        const {
            active,
            label,
            items,
        } = this.props;

        return (
            <div className={styles.barItem}>
                <div
                    className={classNames(styles.text, { [styles.active]: active })}
                    onClick={this.handleClick}
                    onMouseOver={this.handleMouseOver}
                >
                    {label}
                </div>
                <Menu
                    items={items}
                    visible={active}
                    onMenuItemClick={this.handleMenuItemClick}
                />
            </div>
        );
    }
}

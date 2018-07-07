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

    onMouseOver = (e) => {
        e.stopPropagation();
        e.preventDefault();

        this.props.onMouseOver();
    }

    onMenuItemClick = (item) => {
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
                    onClick={this.onClick}
                    onMouseOver={this.onMouseOver}
                >
                    {label}
                </div>
                <Menu
                    items={items}
                    visible={active}
                    onMenuItemClick={this.onMenuItemClick}
                />
            </div>
        );
    }
}

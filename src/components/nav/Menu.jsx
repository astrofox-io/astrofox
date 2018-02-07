import React from 'react';
import classNames from 'classnames';
import MenuItem from 'components/nav/MenuItem';
import styles from './Menu.less';
import globalStyles from 'styles/index.less';

const Menu = ({ items, visible, onMenuItemClick }) => {
    let classes = {
        [styles.menu]: true,
        [globalStyles.displayNone]: (visible === false)
    };

    return (
        <div className={classNames(classes)}>
            {
                items.map((item, index) => {
                    const { type, label, visible, checked, disabled } = item;

                    if (type === 'separator') {
                        return <div key={index} className={styles.separator}/>;
                    }
                    else if (label && visible !== false) {
                        return (
                            <MenuItem
                                key={index}
                                label={label}
                                checked={checked}
                                disabled={disabled}
                                onClick={() => onMenuItemClick(item)}
                            />
                        );
                    }
                })
            }
        </div>
    );
};

Menu.defaultProps = {
    items: [],
    visible: false
};

export default Menu;

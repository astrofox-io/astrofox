import React from 'react';
import classNames from 'classnames';
import MenuItem from 'components/nav/MenuItem';
import styles from './Menu.less';

const Menu = ({ items, visible, onMenuItemClick }) => (
    <div className={classNames({
        [styles.menu]: true,
        [styles.hidden]: visible === false,
    })}
    >
        {
            items.map((item, index) => {
                const {
                    type,
                    label,
                    visible: itemVisible,
                    checked,
                    disabled,
                } = item;

                if (type === 'separator') {
                    return <div key={index} className={styles.separator} />;
                }
                else if (label && itemVisible !== false) {
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

                return null;
            })
        }
    </div>
);

Menu.defaultProps = {
    items: [],
    visible: false,
};

export default Menu;

import React from 'react';
import classNames from 'classnames';
import styles from './Menu.less';

const MenuItem = ({ label, checked, disabled, onClick }) => {
    let classes = {
        [styles.menuItem]: true,
        [styles.menuChecked]: checked,
        [styles.menuDisabled]: disabled
    };

    return (
        <div
            className={classNames(classes)}
            onClick={onClick}>
            {label}
        </div>
    );
};

export default MenuItem;
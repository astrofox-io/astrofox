import React from 'react';
import classNames from 'classnames';
import styles from './Button.less';

const Button = ({ text, disabled, className, onClick }) => {
    let classes = {
        [styles.button]: true,
        [styles.disabled]: disabled
    };

    return (
        <span
            className={classNames(classes, className)}
            onClick={disabled ? null : onClick}>
            {text}
        </span>
    );
};

export default Button;
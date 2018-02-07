import React from 'react';
import classNames from 'classnames';
import Icon from 'components/interface/Icon';
import styles from './ButtonInput.less';

const ButtonInput = ({ title, icon, text, active, disabled, onClick, className }) => (
    <div
        className={
            classNames({
                [styles.button]: true,
                [styles.offScreen]: active,
                [styles.disabled]: disabled,
            }, className)
        }
        title={title}
        onClick={disabled ? null : onClick}>
        {
            icon &&
            <Icon className={styles.icon} glyph={icon} />
        }
        {
            text &&
            <span className={styles.text}>{text}</span>
        }
    </div>
);

export default ButtonInput;
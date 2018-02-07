import React, { Children, cloneElement } from 'react';
import styles from './ButtonGroup.less';

const ButtonGroup = ({ children }) => (
    <div className={styles.group}>
        {
            Children.map(children, child => (
                cloneElement(child, { className: styles.button })
            ))
        }
    </div>
);

export default ButtonGroup;
import React, { Children, cloneElement } from 'react';
import classNames from 'classnames';
import styles from './ButtonGroup.less';

const ButtonGroup = ({ className, children }) => (
    <div className={classNames(styles.group, className)}>
        {
            Children.map(children, child => (
                cloneElement(
                    child,
                    { className: classNames(styles.button, child.props.className) },
                )
            ))
        }
    </div>
);

export default ButtonGroup;

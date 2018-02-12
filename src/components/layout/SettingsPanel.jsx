import React from 'react';
import classNames from 'classnames';
import styles from './SettingsPanel.less';

export const SettingsPanel = ({ id, className, children }) => (
    <div
        id={id}
        className={classNames(styles.panel, className)}
    >
        {children}
    </div>
);

export const Settings = ({ className, children }) => (
    <div className={classNames(styles.settings, className)}>
        {children}
    </div>
);

export const Group = ({ name, className, children }) => (
    <div className={classNames(styles.group, className)}>
        <div className={styles.name}>{name}</div>
        {children}
    </div>
);

export const Row = ({
    label, description, className, children,
}) => (
    <div className={classNames(styles.row, className)}>
        <div className={styles.text}>
            {
                label &&
                <div className={styles.label}>{label}</div>
            }
            {
                description &&
                <div className={styles.description}>{description}</div>
            }
        </div>
        {children}
    </div>
);

export const ButtonRow = ({ children }) => (
    <div className={styles.buttons}>{children}</div>
);

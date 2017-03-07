import React from 'react';
import classNames from 'classnames';
import { styles } from '../../util/object';

export const SettingsPanel = (props) => {
    return (
        <div id={props.id}
            className={classNames('settings-panel', props.className)}
            style={styles(['width', 'height'], props)}>
            {props.children}
        </div>
    );
};

export const Settings = (props) => {
    return (
        <div className={classNames('settings', props.className)}>
            {props.children}
        </div>
    );
};

export const Group = (props) => {
    return (
        <div className={classNames('group', props.className)}>
            <div className="name">{props.name}</div>
            {props.children}
        </div>
    );
};

export const Row = (props) => {
    let label, description;

    if (props.label) {
        label = <div className="label">{props.label}</div>;
    }

    if (props.description) {
        description = <div className="description">{props.description}</div>;
    }

    return (
        <div className={classNames('row', props.className)}>
            <div className="text">
                {label}
                {description}
            </div>
            {props.children}
        </div>
    );
};
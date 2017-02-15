import React from 'react';
import classNames from 'classnames';

export const SettingsPanel = (props) => {
    return (
        <div id={props.id} className={classNames('settings-panel', props.className)}>
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
    let label = (props.label) ?
        <span className="label">{props.label}</span> : null;

    return (
        <div className={classNames('row', props.className)}>
            {label}
            {props.children}
        </div>
    );
};
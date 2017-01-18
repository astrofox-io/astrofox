import React from 'react';
import classNames from 'classnames';

export const Control = (props) => {
    return (
        <div className={classNames('control', props.className)}>
            <div className="header">
                <span className="label">{props.label}</span>
            </div>
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
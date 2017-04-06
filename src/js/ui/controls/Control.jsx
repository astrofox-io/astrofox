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
    let label = null,
        icon = null;

    if (props.label) {
        label = <span className="label">{props.label}</span>;
    }

    if (props.react) {
        icon = <span className="react-icon icon-flash" onClick={props.react} />;
    }

    return (
        <div className={classNames('row', props.className)}>
            {label}
            {icon}
            {props.children}
        </div>
    );
};
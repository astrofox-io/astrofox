import React from 'react';
import classNames from 'classnames';

import Icon from 'components/interface/Icon';
import iconReact from 'svg/icons/flash.svg';

export const Control = (props) => {
    const classes = {
        'control': true,
        'control-active': props.active
    };

    return (
        <div className={classNames(classes, props.className)}>
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
        icon = <Icon className="react-icon" glyph={iconReact} onClick={onReactClick} />;
    }

    return (
        <div className={classNames('row', props.className)}>
            {label}
            {icon}
            {props.children}
        </div>
    );
};

const onReactClick = () => {

};
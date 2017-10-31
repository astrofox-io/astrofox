import React from 'react';
import classNames from 'classnames';

import AudioReactor from 'audio/AudioReactor';
import Reactor from 'components/audio/Reactor';
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

export const Option = (props) => {
    let text, icon, input, reactor,
        { label, className, children, display, reactorName, onReactorChange } = props;

    if (label) {
        text = <span className="label">{label}</span>;
    }

    if (display && display.reactors) {
        reactor = display.reactors[reactorName];
    }

    if (reactorName) {
        const classes = {
            'react-icon': true,
            'react-icon-on': reactor
        };

        const onClick = () => {
            onReactorChange(reactorName, reactor ? null : new AudioReactor());
        };

        icon = (
            <Icon
                className={classNames(classes)}
                glyph={iconReact}
                onClick={onClick}
            />
        );
    }

    input = reactor ? <Reactor reactor={reactor} /> : children;

    return (
        <div className={classNames('option', className)}>
            {text}
            {icon}
            {input}
        </div>
    );
};
import React from 'react';
import classNames from 'classnames';

import ReactorInput from 'components/inputs/ReactorInput';
import Icon from 'components/interface/Icon';
import iconReact from 'svg/icons/flash.svg';

export function Control(props) {
    const classes = {
        'control': true,
        'control-active': props.active
    };

    const children = React.Children.map(props.children, child => {
        if (props.display && child && child.type === Option) {
            return React.cloneElement(child, { display: props.display });
        }
        return child;
    });

    return (
        <div className={classNames(classes, props.className)}>
            <div className="header">
                <span className="label">{props.label}</span>
            </div>
            {children}
        </div>
    );
}

export function Option(props) {
    let text, icon, input, reactor,
        { label, className, children, display, reactorName, reactorMin, reactorMax, onReactorChange } = props;

    if (label) {
        text = <span className="label">{label}</span>;
    }

    if (display && display.reactors) {
        reactor = display.reactors[reactorName];
        if (reactor) {
            reactor.label = ['REACTOR', display.options.displayName, label].join(' → ');
        }
    }

    if (reactorName) {
        const classes = {
            'reactor-icon': true,
            'reactor-icon-on': reactor
        };

        const onIconClick = () => {
            onReactorChange(
                reactorName,
                {
                    lastValue: display.options[reactorName],
                    min: reactorMin || 0,
                    max: reactorMax || 1
                });
        };

        icon = (
            <Icon
                className={classNames(classes)}
                glyph={iconReact}
                title={reactor ? 'Enable Reactor' : 'Disable Reactor'}
                onClick={onIconClick}
            />
        );
    }

    input = reactor ? <ReactorInput reactor={reactor} /> : children;

    return (
        <div className={classNames('option', className)}>
            {text}
            {icon}
            {input}
        </div>
    );
}
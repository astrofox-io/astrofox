import React, { Children, cloneElement } from 'react';
import classNames from 'classnames';
import ReactorInput from 'components/inputs/ReactorInput';
import Icon from 'components/interface/Icon';
import iconReact from 'svg/icons/flash.svg';
import styles from './Control.less';

export function Control({ label, active, className, display, children }) {
    return (
        <div className={classNames({
            [styles.control]: true,
            [styles.active]: active
        }, className)}
        >
            {
                label &&
                <div className={styles.header}>
                    <span className={styles.text}>
                        {label}
                    </span>
                </div>
            }
            {
                Children.map(children, child => {
                    if (display && child && child.type === Option) {
                        return cloneElement(child, { display });
                    }
                    return child;
                })
            }
        </div>
    );
}

export function Option({
    className, children, display,
    reactorName, reactorMin, reactorMax, onReactorChange
}) {
    let icon, reactor;

    if (display && display.reactors) {
        reactor = display.reactors[reactorName];
        if (reactor) {
            reactor.label = ['REACTOR', display.options.displayName];
        }
    }

    if (reactorName) {
        icon = (
            <Icon
                className={classNames({
                    [styles.reactorIcon]: true,
                    [styles.reactorIconActive]: reactor
                })}
                glyph={iconReact}
                title={reactor ? 'Disable Reactor' : 'Enable Reactor'}
                onClick={() => {
                    onReactorChange(
                        reactorName,
                        {
                            lastValue: display.options[reactorName],
                            min: reactorMin || 0,
                            max: reactorMax || 1
                        }
                    );
                }}
            />
        );
    }

    return (
        <div className={classNames(styles.option, className)}>
            {
                reactor ?
                    <ReactorInput reactor={reactor} /> :
                    children
            }
            {icon}
        </div>
    );
}

export function Label({ text, className, children }) {
    return (
        <div className={classNames(styles.label, className)}>
            {text}
            {children && children}
        </div>
    );
}
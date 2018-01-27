import React from 'react';
import { filterByKey } from 'utils/object';

const defaultKeys = ['width', 'height', 'margin', 'padding', 'border'];

export function FirstChild(props) {
    const children = React.Children.toArray(props.children);
    return children[0] || null;
}

export function styleProps(props, keys) {
    keys = keys || defaultKeys;
    let obj = filterByKey(keys, props);

    if (typeof props.style === 'object') {
        Object.assign(obj, props.style);
    }

    return obj;
}
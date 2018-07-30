import React from 'react';

export function FirstChild(props) {
    const children = React.Children.toArray(props.children);
    return children[0] || null;
}

export function ignoreEvents(e) {
    e.stopPropagation();
    e.preventDefault();
}

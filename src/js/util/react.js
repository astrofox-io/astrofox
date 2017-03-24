import React from 'react';

export function FirstChild(props) {
    const children = React.Children.toArray(props.children);
    return children[0] || null;
}
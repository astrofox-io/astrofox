import React from 'react';

export function FirstChild({ children }) {
    return (React.Children.toArray(children))[0] || null;
}

export function ignoreEvents(e) {
    e.stopPropagation();
    e.preventDefault();
}

import React, { Children, Fragment, cloneElement } from 'react';

export function FirstChild({ children }) {
  return React.Children.toArray(children)[0] || null;
}

export function ignoreEvents(e) {
  e.stopPropagation();
  e.preventDefault();
}

export function inputToProps(callback) {
  return (name, value) => callback({ [name]: value });
}

export function mapChildren(children, props, callback) {
  return Children.map(children, child => {
    if (child) {
      if (child.type === Fragment) {
        return mapChildren(child.props.children, props);
      }

      const args = callback ? callback(child, props) : [child, props];

      return cloneElement(...args);
    }
    return child;
  });
}

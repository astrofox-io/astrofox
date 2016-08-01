'use strict';

const React = require('react');
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');

const Overlay = (props) => {
    return (
        <ReactCSSTransitionGroup
            component={Component}
            transitionName="modal"
            transitionEnterTimeout={300}
            transitionLeaveTimeout={300}>
            {props.children}
        </ReactCSSTransitionGroup>
    );
};

const Component = (props) => {
    let style = (React.Children.count(props.children) > 0) ? null : {display:'none'};

    return (
        <div id="overlay" style={style}>
            {props.children}
        </div>
    );
};

module.exports = Overlay;
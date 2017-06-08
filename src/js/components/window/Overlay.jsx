import React from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

const Overlay = (props) => {
    return (
        <CSSTransitionGroup
            component={Component}
            transitionName="overlay"
            transitionEnterTimeout={300}
            transitionLeaveTimeout={300}>
            {props.children}
        </CSSTransitionGroup>
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

export default Overlay;
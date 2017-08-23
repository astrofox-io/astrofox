import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

const Overlay = (props) => {
    let children = React.Children.map(props.children, (child, index) => {
        return (
            <CSSTransition
                key={index}
                classNames="overlay"
                timeout={{ enter: 300, exit: 300 }}>
                {child}
            </CSSTransition>
        );
    });
    return (
        <TransitionGroup component={Component}>
            {children}
        </TransitionGroup>
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
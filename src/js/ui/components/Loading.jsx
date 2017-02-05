import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

const Loading = (props) => {
    const loading = (props.visible) ? <div className="loading" /> : null;

    return (
        <ReactCSSTransitionGroup
            transitionName="loading"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={500}>
            {loading}
        </ReactCSSTransitionGroup>
    );
};

Loading.defaultProps = {
    visible: false
};

export default Loading;
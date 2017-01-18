import React from 'react';
import classNames from 'classnames';

const Loading = (props) => {
    return (
        <div className={classNames('loading', {'loading-active': props.visible})}></div>
    );
};

Loading.defaultProps = {
    visible: false
};

export default Loading;
import React from 'react';
import classNames from 'classnames';

const Checkmark = (props) => {
    let style = {
        width: props.size + 'px',
        height: props.size + 'px'
    };

    return (
        <div className={classNames('checkmark', props.className)} style={style}>
            <svg className="svg" viewBox="0 0 72 72">
                <circle className="circle" cx="36" cy="36" r="35" />
                <path className="path" d="M17.417,37.778l9.93,9.909l25.444-25.393" />
            </svg>
        </div>
    );
};

export default Checkmark;
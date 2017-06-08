import React from 'react';
import classNames from 'classnames';

const Spinner = (props) => {
    let style = {
        width: props.size + 'px',
        height: props.size + 'px'
    };

    return (
        <div className={classNames('spinner', props.className)} style={style}>
            <svg className="svg" viewBox="25 25 50 50">
                <circle
                    className="circle"
                    cx="50"
                    cy="50"
                    r="20"
                    fill="none"
                    strokeWidth="2"
                    strokeMiterlimit="10"
                />
            </svg>
        </div>
    );
};

export default Spinner;
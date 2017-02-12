import React from 'react';

const Spinner = (props) => {
    let style = {
        width: props.size,
        height: props.size
    };

    return (
        <div className="spinner" style={style}>
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
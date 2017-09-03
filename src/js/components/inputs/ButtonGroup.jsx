import React from 'react';

const ButtonGroup = (props) => {
    return (
        <div className="input-button-group">
            {props.children}
        </div>
    );
};

export default ButtonGroup;
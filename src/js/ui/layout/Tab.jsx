import React from 'react';

const Tab = (props) => {
    let style = (props.visible) ? null : {display: 'none'};

    return (
        <div className={props.className} style={style}>
            {props.children}
        </div>
    );
};

export default Tab;
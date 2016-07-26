'use strict';

const React = require('react');

const Tab = (props) => {
    let style = (props.visible) ? null : {display: 'none'};

    return (
        <div className={props.className} style={style}>
            {props.children}
        </div>
    );
};

module.exports = Tab;
'use strict';

const React = require('react');

const Splitter = (props) => {
    let classes = 'splitter splitter-' + props.type;
    let onMouseDown = (e) => props.onDragStart(e);

    return (
        <div
            className={classes}
            onMouseDown={onMouseDown}>
            <span className="icon-dots-three-horizontal" />
        </div>
    );
};

Splitter.defaultProps = {
    type: 'horizontal',
    onDragStart: () => {}
};

module.exports = Splitter;
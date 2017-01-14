'use strict';

const React = require('react');
const classNames = require('classnames');

const Splitter = (props) => {
    let classes = {
            splitter: true,
            vertical: props.type === 'vertical',
            horizontal: props.type !== 'vertical'
        },
        onMouseDown = (e) => props.onDragStart(e);

    return (
        <div
            className={classNames(classes)}
            onMouseDown={onMouseDown}>
            <span className="grip icon-dots-three-horizontal"/>
        </div>
    );
};

Splitter.defaultProps = {
    type: 'horizontal',
    onDragStart: () => {
    }
};

module.exports = Splitter;
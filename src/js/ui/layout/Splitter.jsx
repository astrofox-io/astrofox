import React from 'react';
import classNames from 'classnames';

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

export default Splitter;
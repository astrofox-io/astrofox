import React from 'react';
import classNames from 'classnames';
import Icon from 'components/interface/Icon';
import iconDots from 'svg/icons/dots-three-horizontal.svg';

const Splitter = (props) => {
    let classes = {
            splitter: true,
            vertical: props.type === 'vertical',
            horizontal: props.type !== 'vertical'
        },
        onMouseDown = (e) => {
            e.stopPropagation();
            e.preventDefault();

            props.onResize(e.pageX, e.pageY);
        };

    return (
        <div
            className={classNames(classes)}
            onMouseDown={onMouseDown}>
            <Icon className="grip" glyph={iconDots} />
        </div>
    );
};

Splitter.defaultProps = {
    type: 'horizontal',
    onResize: () => {}
};

export default Splitter;
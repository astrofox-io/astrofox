import React from 'react';

const Icon = (props) => {
    let { className, width, height, onClick } = props,
        { viewBox, url } = props.glyph;

    return (
        <svg className={className} viewBox={viewBox} width={width} height={height} onClick={onClick}>
            <use xlinkHref={url} />
        </svg>
    );
};

export default Icon;
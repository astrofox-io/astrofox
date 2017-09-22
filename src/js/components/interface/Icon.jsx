import React from 'react';

const Icon = (props) => {
    let { className, width, height } = props,
        { viewBox, url } = props.glyph;

    return (
        <svg className={className} viewBox={viewBox} width={width} height={height}>
            <use xlinkHref={url} />
        </svg>
    );
};

export default Icon;
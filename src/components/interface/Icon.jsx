import React from 'react';

const Icon = (props) => {
    let { className, width, height, onClick, title } = props,
        { viewBox, url } = props.glyph;

    return (
        <span className={className} title={title}>
            <svg role="img" viewBox={viewBox} width={width} height={height} onClick={onClick}>
                <use xlinkHref={url} />
            </svg>
        </span>
    );
};

export default Icon;
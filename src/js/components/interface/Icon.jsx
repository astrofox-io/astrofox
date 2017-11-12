import React from 'react';

const Icon = (props) => {
    let { className, width, height, onClick, title } = props,
        { viewBox, url } = props.glyph;

    return (
        <svg role="img" className={className} viewBox={viewBox} width={width} height={height} onClick={onClick}>
            {title ? <title>{title}</title> : null}
            <use xlinkHref={url} />
        </svg>
    );
};

export default Icon;
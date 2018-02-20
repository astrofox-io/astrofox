import React from 'react';
import classNames from 'classnames';
import styles from './Icon.less';

const Icon = ({
    className,
    width,
    height,
    onClick,
    title,
    glyph: {
        viewBox,
        url,
    },
}) => (
    <span
        className={classNames(styles.icon, className)}
        title={title}
    >
        <svg
            role="img"
            viewBox={viewBox}
            width={width}
            height={height}
            onClick={onClick}
        >
            <use xlinkHref={url} />
        </svg>
    </span>
);

export default Icon;

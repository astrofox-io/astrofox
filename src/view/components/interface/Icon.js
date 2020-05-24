import React from 'react';
import classNames from 'classnames';
import styles from './Icon.less';

const Icon = ({
  className,
  width,
  height,
  title,
  glyph: { viewBox, url },
  shapeRendering,
  onClick,
}) => (
  <span className={classNames(styles.icon, className)} title={title}>
    <svg
      viewBox={viewBox}
      width={width}
      height={height}
      onClick={onClick}
      shapeRendering={shapeRendering}
    >
      <use xlinkHref={url} />
    </svg>
  </span>
);

Icon.defaultProps = {
  shapeRendering: 'geometricPrecision',
};

export default Icon;

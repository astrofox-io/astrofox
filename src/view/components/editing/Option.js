import React from 'react';
import classNames from 'classnames';
import { RangeInput, ReactorButton, ReactorInput } from 'components/inputs';
import inputComponents from 'components/editing/inputComponents';
import Icon from 'components/interface/Icon';
import { Link } from 'view/icons';
import styles from './Option.less';

export default function Option({
  display,
  label,
  type = null,
  name,
  value,
  className,
  onChange,
  hidden,
  withReactor,
  withRange,
  withLink,
  linkActive,
  onLinkClick,
  children,
  ...otherProps
}) {
  const [InputCompnent, inputProps] = inputComponents[type];
  const reactor = display.getReactor?.(name);
  const showReactor = withReactor && reactor;
  const { min, max } = otherProps;

  return (
    <div className={classNames(styles.option, className, { [styles.hidden]: hidden })}>
      {withReactor && (
        <ReactorButton
          className={styles.reactorIcon}
          display={display}
          name={name}
          min={min}
          max={max}
        />
      )}
      <div className={styles.label}>
        {label}
        {withLink && (
          <Icon
            className={classNames(styles.linkIcon, {
              [styles.linkIconActive]: linkActive,
            })}
            glyph={Link}
            onClick={onLinkClick}
          />
        )}
      </div>
      {showReactor && <ReactorInput display={display} name={name} value={value} />}
      {!showReactor && (
        <>
          {InputCompnent && (
            <InputCompnent
              {...inputProps}
              {...otherProps}
              name={name}
              value={value}
              onChange={onChange}
            />
          )}
          {withRange && (
            <RangeInput {...otherProps} name={name} value={value} onChange={onChange} smallThumb />
          )}
          {children}
        </>
      )}
    </div>
  );
}

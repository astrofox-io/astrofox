import React from 'react';
import classNames from 'classnames';
import {
  TextInput,
  NumberInput,
  ToggleInput,
  ColorInput,
  ColorRangeInput,
  RangeInput,
  SelectInput,
  ImageInput,
  ReactorButton,
  ReactorInput,
} from 'components/inputs';
import Icon from 'components/interface/Icon';
import { Link } from 'view/icons';
import styles from './Option.less';

const inputComponents = {
  text: [TextInput, { width: 140 }],
  number: [NumberInput, { width: 40 }],
  toggle: [ToggleInput],
  color: [ColorInput],
  colorrange: [ColorRangeInput],
  range: [RangeInput],
  select: [SelectInput, { width: 140 }],
  image: [ImageInput],
};

export default function Option({
  display,
  label,
  type,
  name,
  value,
  className,
  onChange,
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
    <div className={classNames(styles.option, className)}>
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
            <RangeInput
              {...otherProps}
              name={name}
              value={value}
              onChange={onChange}
              hideThumb
              showThumbOnHover
            />
          )}
          {children}
        </>
      )}
    </div>
  );
}

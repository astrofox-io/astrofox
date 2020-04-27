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

  return (
    <div className={classNames(styles.option, className)}>
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
      {InputCompnent && <InputCompnent {...inputProps} {...otherProps} onChange={onChange} />}
      {withRange && <RangeInput {...otherProps} onChange={onChange} />}
      {children}
    </div>
  );
}

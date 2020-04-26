import React, { useRef } from 'react';
import classNames from 'classnames';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import Icon from 'components/interface/Icon';
import { NumberInput, ImageInput, RangeInput, ReactorInput } from 'components/inputs';
import { Link } from 'view/icons';
import { BLANK_IMAGE } from 'view/constants';
import styles from './ImageControl.less';

function ImageControl({
  display,
  active,
  stageWidth,
  stageHeight,
  fixed,
  src,
  width,
  height,
  x,
  y,
  rotation,
  opacity,
  onChange,
}) {
  const image = useRef();
  const disabled = !(image.current && image.current.src !== BLANK_IMAGE);
  const imageWidth = disabled ? 0 : image.current.naturalWidth;
  const imageHeight = disabled ? 0 : image.current.naturalHeight;
  const maxWidth = imageWidth * 2;
  const maxHeight = imageHeight * 2;
  const xMax = imageWidth > stageWidth ? imageWidth : stageWidth;
  const yMax = imageHeight > stageHeight ? imageHeight : stageHeight;

  function handleChange(name, value) {
    const { naturalWidth, naturalHeight } = image.current;
    const ratio = naturalWidth / naturalHeight;
    const obj = {};

    if (name === 'src') {
      // Reset values
      if (value === BLANK_IMAGE) {
        obj.width = 1;
        obj.height = 1;
        obj.x = 0;
        obj.y = 0;
        obj.rotation = 0;
        obj.opacity = 1.0;
      }

      // Load new image
      if (value !== src) {
        obj.width = naturalWidth || 1;
        obj.height = naturalHeight || 1;
        obj.opacity = 1.0;
      }
    } else if (name === 'width' && fixed) {
      obj.height = Math.round(value * (1 / ratio)) || 0;
    } else if (name === 'height' && fixed) {
      obj.width = Math.round(value * ratio);
    }

    onChange(name, value, obj);
  }

  function handleLinkClick() {
    handleChange('fixed', !fixed);
  }

  return (
    <Control label="Image" active={active} display={display}>
      <Option>
        <Label text="Image" />
        <ImageInput name="src" ref={image} value={src} onChange={handleChange} />
      </Option>
      <Option>
        <Label text="Width">
          <Icon
            className={classNames({
              [styles.linkIcon]: true,
              [styles.linkIconActive]: fixed,
            })}
            glyph={Link}
            onClick={handleLinkClick}
          />
        </Label>
        <NumberInput
          name="width"
          width={40}
          min={0}
          max={maxWidth}
          value={width}
          disabled={disabled}
          onChange={handleChange}
        />
        <RangeInput
          name="width"
          min={0}
          max={maxWidth}
          value={width}
          disabled={disabled}
          onChange={handleChange}
        />
      </Option>
      <Option>
        <Label text="Height">
          <Icon
            className={classNames({
              [styles.linkIcon]: true,
              [styles.linkIconActive]: fixed,
            })}
            glyph={Link}
            onClick={handleLinkClick}
          />
        </Label>
        <NumberInput
          name="height"
          width={40}
          min={0}
          max={maxHeight}
          value={height}
          disabled={disabled}
          onChange={handleChange}
        />
        <RangeInput
          name="height"
          min={0}
          max={maxHeight}
          value={height}
          disabled={disabled}
          onChange={handleChange}
        />
      </Option>
      <Option>
        <Label text="X" />
        <NumberInput
          name="x"
          width={40}
          min={disabled ? 0 : -xMax}
          max={disabled ? 0 : xMax}
          value={x}
          disabled={disabled}
          onChange={handleChange}
        />
        <RangeInput
          name="x"
          min={disabled ? 0 : -xMax}
          max={disabled ? 0 : xMax}
          value={x}
          disabled={disabled}
          onChange={handleChange}
        />
      </Option>
      <Option>
        <Label text="Y" />
        <NumberInput
          name="y"
          width={40}
          min={disabled ? 0 : -yMax}
          max={disabled ? 0 : yMax}
          value={y}
          disabled={disabled}
          onChange={handleChange}
        />
        <RangeInput
          name="y"
          min={disabled ? 0 : -yMax}
          max={disabled ? 0 : yMax}
          value={y}
          disabled={disabled}
          onChange={handleChange}
        />
      </Option>
      <Option>
        <Label text="Rotation" />
        <NumberInput
          name="rotation"
          width={40}
          min={0}
          max={disabled ? 0 : 360}
          value={rotation}
          disabled={disabled}
          onChange={handleChange}
        />
        <RangeInput
          name="rotation"
          min={0}
          max={disabled ? 0 : 360}
          value={rotation}
          disabled={disabled}
          onChange={handleChange}
        />
      </Option>
      <Option>
        <Label text="Opacity" />
        <ReactorInput name="opacity">
          <NumberInput
            name="opacity"
            width={40}
            min={0}
            max={disabled ? 0 : 1.0}
            step={0.01}
            value={opacity}
            disabled={disabled}
            onChange={handleChange}
          />
          <RangeInput
            name="opacity"
            min={0}
            max={disabled ? 0 : 1.0}
            step={0.01}
            value={opacity}
            disabled={disabled}
            onChange={handleChange}
          />
        </ReactorInput>
      </Option>
    </Control>
  );
}

export default DisplayControl(ImageControl);

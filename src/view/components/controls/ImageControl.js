import React, { useRef } from 'react';
import withDisplay from 'components/hocs/withDisplay';
import { Control, Option } from 'components/editing';
import { BLANK_IMAGE } from 'view/constants';

function ImageControl({ display, active, stageWidth, stageHeight, onChange }) {
  const { fixed, src, width, height, x, y, rotation, opacity } = display.properties;
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
    <Control label="Image" active={active} display={display} onChange={handleChange}>
      <Option label="Image" type="image" name="src" forwardRef={image} value={src} />
      <Option
        label="Width"
        type="number"
        name="width"
        value={width}
        min={0}
        max={maxWidth}
        disabled={disabled}
        withLink
        linkActive={fixed}
        onLinkClick={handleLinkClick}
        withRange
      />
      <Option
        label="Height"
        type="number"
        name="height"
        value={height}
        min={0}
        max={maxHeight}
        disabled={disabled}
        withLink
        linkActive={fixed}
        onLinkClick={handleLinkClick}
        withRange
      />
      <Option
        label="X"
        type="number"
        name="x"
        value={x}
        min={disabled ? 0 : -xMax}
        max={disabled ? 0 : xMax}
        disabled={disabled}
        withRange
      />
      <Option
        label="Y"
        type="number"
        name="y"
        value={y}
        min={disabled ? 0 : -yMax}
        max={disabled ? 0 : yMax}
        disabled={disabled}
        withRange
      />
      <Option
        label="Rotation"
        type="number"
        name="rotation"
        value={rotation}
        min={0}
        max={disabled ? 0 : 360}
        disabled={disabled}
        withRange
      />
      <Option
        label="Opacity"
        type="number"
        name="opacity"
        value={opacity}
        min={0}
        max={disabled ? 0 : 1.0}
        step={0.01}
        disabled={disabled}
        withRange
      />
    </Control>
  );
}

export default withDisplay(ImageControl);

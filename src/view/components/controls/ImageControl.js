import React, { useRef } from 'react';
import { Control, Option } from 'components/editing';
import { BLANK_IMAGE } from 'view/constants';
import useEntity from 'components/hooks/useEntity';

export default function ImageControl({ display, active, stageWidth, stageHeight }) {
  const { fixed, src, width, height, x, y, rotation, opacity } = display.properties;
  const image = useRef();
  const disabled = !(image.current && image.current.src !== BLANK_IMAGE);
  const imageWidth = disabled ? 0 : image.current.naturalWidth;
  const imageHeight = disabled ? 0 : image.current.naturalHeight;
  const maxWidth = imageWidth * 2;
  const maxHeight = imageHeight * 2;
  const xMax = imageWidth > stageWidth ? imageWidth : stageWidth;
  const yMax = imageHeight > stageHeight ? imageHeight : stageHeight;
  const onChange = useEntity(display);

  function handleChange(props) {
    const { naturalWidth, naturalHeight } = image.current;
    const ratio = naturalWidth / naturalHeight;

    if (props.src !== undefined) {
      // Reset values
      if (props.src === BLANK_IMAGE) {
        props.width = 1;
        props.height = 1;
        props.x = 0;
        props.y = 0;
        props.rotation = 0;
        props.opacity = 1.0;
      }

      // Load new image
      if (props.src !== src) {
        props.width = naturalWidth || 1;
        props.height = naturalHeight || 1;
        props.opacity = 1.0;
      }
    } else if (props.width && fixed) {
      props.height = Math.round(props.width * (1 / ratio)) || 0;
    } else if (props.height && fixed) {
      props.width = Math.round(props.height * ratio);
    }

    onChange(props);
  }

  function handleLinkClick() {
    handleChange({ fixed: !fixed });
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


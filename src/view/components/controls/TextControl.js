import React from 'react';
import { Control, Option } from 'components/editing';
import useEntity from 'components/hooks/useEntity';
import fonts from 'config/fonts.json';

const fontOptions = fonts.map(item => ({ name: item, value: item, style: { fontFamily: item } }));

export default function TextControl({ display, active, stageWidth, stageHeight }) {
  const { text, size, font, bold, italic, color, x, y, rotation, opacity } = display.properties;
  const onChange = useEntity(display);

  return (
    <Control label="Text" active={active} display={display} onChange={onChange}>
      <Option label="Text" type="text" name="text" value={text} />
      <Option label="Font" type="select" name="font" items={fontOptions} value={font} />
      <Option label="Size" type="number" name="size" min={0} value={size} />
      <Option label="Bold" type="toggle" name="bold" value={bold} />
      <Option label="Italic" type="toggle" name="italic" value={italic} />
      <Option label="Color" type="color" name="color" value={color} />
      <Option
        label="X"
        type="number"
        name="x"
        min={-stageWidth}
        max={stageWidth}
        value={x}
        withRange
      />
      <Option
        label="Y"
        type="number"
        name="y"
        min={-stageHeight}
        max={stageHeight}
        value={y}
        withRange
      />
      <Option
        label="Rotation"
        type="number"
        name="rotation"
        min={0}
        max={360}
        value={rotation}
        withRange
      />
      <Option
        label="Opacity"
        type="number"
        name="opacity"
        value={opacity}
        min={0}
        max={1.0}
        step={0.01}
        withRange
      />
    </Control>
  );
}

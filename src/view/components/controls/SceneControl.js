import React from 'react';
import { Control, Option } from 'components/editing';
import useEntity from 'components/hooks/useEntity';
import { SEPARATOR } from 'components/inputs/SelectInput';

const blendOptions = [
  'None',
  'Normal',
  SEPARATOR,
  'Darken',
  'Multiply',
  'Color Burn',
  'Linear Burn',
  SEPARATOR,
  'Lighten',
  'Screen',
  'Color Dodge',
  'Linear Dodge',
  SEPARATOR,
  'Overlay',
  'Soft Light',
  'Hard Light',
  'Vivid Light',
  'Linear Light',
  'Pin Light',
  'Hard Mix',
  SEPARATOR,
  'Difference',
  'Exclusion',
  'Subtract',
  'Divide',
  SEPARATOR,
  'Negation',
  'Phoenix',
  'Glow',
  'Reflect',
];

export default function SceneControl({ display, active }) {
  const { blendMode, opacity, mask, inverse } = display.properties;
  const onChange = useEntity(display);

  function handleChange(props) {
    // Ignore separators
    if (props.blendMode === null) {
      return;
    }

    onChange(props);
  }

  return (
    <Control label="Scene" active={active} display={display} onChange={handleChange}>
      <Option
        label="Blending"
        type="select"
        name="blendMode"
        items={blendOptions}
        value={blendMode}
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
        withReactor
      />
      <Option label="Mask" type="toggle" name="mask" value={mask} />
      <Option label="Inverse" type="toggle" name="inverse" value={inverse} hidden={!mask} />
    </Control>
  );
}

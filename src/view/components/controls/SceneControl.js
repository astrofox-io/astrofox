import React from 'react';
import withDisplay from 'components/hocs/withDisplay';
import { Control, Option } from 'components/editing';

const blendOptions = [
  'None',
  'Normal',
  { separator: true },
  'Darken',
  'Multiply',
  'Color Burn',
  'Linear Burn',
  { separator: true },
  'Lighten',
  'Screen',
  'Color Dodge',
  'Linear Dodge',
  { separator: true },
  'Overlay',
  'Soft Light',
  'Hard Light',
  'Vivid Light',
  'Linear Light',
  'Pin Light',
  'Hard Mix',
  { separator: true },
  'Difference',
  'Exclusion',
  'Subtract',
  'Divide',
  { separator: true },
  'Negation',
  'Phoenix',
  'Glow',
  'Reflect',
];

function SceneControl({ display, active, onChange }) {
  const { blendMode, opacity, mask, inverse } = display.properties;

  function handleChange(name, value) {
    // Ignore separators
    if (name === 'blendMode' && typeof value !== 'string') {
      return;
    }

    onChange(name, value);
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
      <Option label="Inverse" type="toggle" name="inverse" value={inverse} />
    </Control>
  );
}

export default withDisplay(SceneControl);

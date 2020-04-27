import React from 'react';
import { Control, Option } from 'components/editing';
import { ToggleInput } from 'components/inputs';
import withDisplay from 'components/hocs/withDisplay';

function BarSpectrumControl({ display, active, stageWidth, stageHeight, onChange }) {
  const {
    maxDecibels,
    minFrequency,
    maxFrequency,
    smoothingTimeConstant,
    width,
    height,
    shadowHeight,
    barWidth,
    barWidthAutoSize,
    barSpacing,
    barSpacingAutoSize,
    x,
    y,
    color,
    shadowColor,
    rotation,
    opacity,
  } = display.properties;

  function handleChange(name, value) {
    const obj = {};

    if (name === 'barWidthAutoSize') {
      obj.barWidth = value ? -1 : 1;
    } else if (name === 'barSpacingAutoSize') {
      obj.barSpacing = value ? -1 : 1;
    }

    onChange(name, value, obj);
  }

  return (
    <Control label="Bar Spectrum" active={active} display={display} onChange={handleChange}>
      <Option
        label="Max dB"
        type="number"
        name="maxDecibels"
        value={maxDecibels}
        min={-40}
        max={0}
        step={1}
        withRange
      />
      <Option
        label="Min Frequency"
        type="number"
        name="minFrequency"
        value={minFrequency}
        min={0}
        max={maxFrequency}
        step={10}
        withRange
      />
      <Option
        label="Max Frequency"
        type="number"
        name="maxFrequency"
        value={maxFrequency}
        min={minFrequency}
        max={22000}
        step={10}
        withRange
      />
      <Option
        label="Smoothing"
        type="number"
        name="smoothingTimeConstant"
        value={smoothingTimeConstant}
        min={0}
        max={0.99}
        step={0.01}
        withRange
      />
      <Option
        label="Width"
        type="number"
        name="width"
        value={width}
        min={0}
        max={stageWidth}
        withRange
      />
      <Option
        label="Height"
        type="number"
        name="height"
        value={height}
        min={0}
        max={stageHeight}
        withRange
      />
      <Option
        label="Shadow Height"
        type="number"
        name="shadowHeight"
        value={shadowHeight}
        min={0}
        max={stageWidth}
        withRange
      />
      <Option
        label="Bar Width"
        type="number"
        name="barWidth"
        value={barWidth}
        min={-1}
        max={stageWidth}
        disabled={barWidthAutoSize}
        hidden={barWidthAutoSize}
      >
        <ToggleInput
          label="Auto-size"
          name="barWidthAutoSize"
          value={barWidthAutoSize}
          onChange={handleChange}
        />
      </Option>
      <Option
        label="Bar Spacing"
        type="number"
        name="barSpacing"
        value={barSpacing}
        min={-1}
        max={stageWidth}
        disabled={barSpacingAutoSize}
        hidden={barSpacingAutoSize}
      >
        <ToggleInput
          label="Auto-size"
          name="barSpacingAutoSize"
          value={barSpacingAutoSize}
          onChange={handleChange}
        />
      </Option>
      <Option
        label="Bar Color"
        type="colorrange"
        name="color"
        startColor={color[0]}
        endColor={color[1]}
      />
      <Option
        label="Shadow Color"
        type="colorrange"
        name="shadowColor"
        startColor={shadowColor[0]}
        endColor={shadowColor[1]}
      />
      <Option
        label="X"
        type="number"
        name="x"
        value={x}
        min={-stageWidth}
        max={stageWidth}
        withRange
      />
      <Option
        label="Y"
        type="number"
        name="y"
        value={y}
        min={-stageHeight}
        max={stageHeight}
        withRange
      />
      <Option
        label="Rotation"
        type="number"
        name="rotation"
        value={rotation}
        min={0}
        max={360}
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

export default withDisplay(BarSpectrumControl);

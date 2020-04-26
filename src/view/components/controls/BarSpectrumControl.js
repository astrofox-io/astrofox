import React from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import {
  NumberInput,
  ColorRangeInput,
  RangeInput,
  ToggleInput,
  ReactorInput,
} from 'components/inputs';

function BarSpectrumControl({
  displayName,
  active,
  stageWidth,
  stageHeight,
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
  onChange,
}) {
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
    <Control label="Bar Spectrum" active={active} displayName={displayName}>
      <Option>
        <Label text="Max dB" />
        <NumberInput
          name="maxDecibels"
          value={maxDecibels}
          width={40}
          min={-40}
          max={0}
          step={1}
          onChange={handleChange}
        />
        <RangeInput
          name="maxDecibels"
          value={maxDecibels}
          min={-40}
          max={0}
          step={1}
          onChange={handleChange}
        />
      </Option>
      <Option>
        <Label text="Min Frequency" />
        <NumberInput
          name="minFrequency"
          value={minFrequency}
          width={40}
          min={0}
          max={maxFrequency}
          step={10}
          onChange={handleChange}
        />
        <RangeInput
          name="minFrequency"
          value={minFrequency}
          min={0}
          max={22000}
          step={10}
          upperLimit={maxFrequency}
          onChange={handleChange}
        />
      </Option>
      <Option>
        <Label text="Max Frequency" />
        <NumberInput
          name="maxFrequency"
          value={maxFrequency}
          width={40}
          min={minFrequency}
          max={22000}
          step={10}
          onChange={handleChange}
        />
        <RangeInput
          name="maxFrequency"
          value={maxFrequency}
          min={0}
          max={22000}
          step={10}
          lowerLimit={minFrequency}
          onChange={handleChange}
        />
      </Option>
      <Option>
        <Label text="Smoothing" />
        <NumberInput
          name="smoothingTimeConstant"
          value={smoothingTimeConstant}
          width={40}
          min={0}
          max={0.99}
          step={0.01}
          onChange={handleChange}
        />
        <RangeInput
          name="smoothingTimeConstant"
          value={smoothingTimeConstant}
          min={0}
          max={0.99}
          step={0.01}
          onChange={handleChange}
        />
      </Option>
      <Option>
        <Label text="Width" />
        <NumberInput
          name="width"
          value={width}
          width={40}
          min={0}
          max={stageWidth}
          onChange={handleChange}
        />
        <RangeInput name="width" value={width} min={0} max={stageWidth} onChange={handleChange} />
      </Option>
      <Option>
        <Label text="Height" />
        <NumberInput
          name="height"
          value={height}
          width={40}
          min={0}
          max={stageWidth}
          onChange={handleChange}
        />
        <RangeInput name="height" value={height} min={0} max={stageWidth} onChange={handleChange} />
      </Option>
      <Option>
        <Label text="Shadow Height" />
        <NumberInput
          name="shadowHeight"
          value={shadowHeight}
          width={40}
          min={0}
          max={stageWidth}
          onChange={handleChange}
        />
        <RangeInput
          name="shadowHeight"
          value={shadowHeight}
          min={0}
          max={stageWidth}
          onChange={handleChange}
        />
      </Option>
      <Option>
        <Label text="Bar Width" />
        <NumberInput
          name="barWidth"
          value={barWidth}
          width={40}
          min={-1}
          max={stageWidth}
          disabled={barWidthAutoSize}
          hidden={barWidthAutoSize}
          onChange={handleChange}
        />
        <Label text="Auto-Size" />
        <ToggleInput name="barWidthAutoSize" value={barWidthAutoSize} onChange={handleChange} />
      </Option>
      <Option>
        <Label text="Bar Spacing" />
        <NumberInput
          name="barSpacing"
          value={barSpacing}
          width={40}
          min={-1}
          max={stageWidth}
          disabled={barSpacingAutoSize}
          hidden={barSpacingAutoSize}
          onChange={handleChange}
        />
        <Label text="Auto-Size" />
        <ToggleInput name="barSpacingAutoSize" value={barSpacingAutoSize} onChange={handleChange} />
      </Option>
      <Option>
        <Label text="Bar Color" />
        <ColorRangeInput
          name="color"
          startColor={color[0]}
          endColor={color[1]}
          onChange={handleChange}
        />
      </Option>
      <Option>
        <Label text="Shadow Color" />
        <ColorRangeInput
          name="shadowColor"
          startColor={shadowColor[0]}
          endColor={shadowColor[1]}
          onChange={handleChange}
        />
      </Option>
      <Option>
        <Label text="X" />
        <NumberInput
          name="x"
          value={x}
          width={40}
          min={-stageWidth}
          max={stageWidth}
          onChange={handleChange}
        />
        <RangeInput name="x" value={x} min={-stageWidth} max={stageWidth} onChange={handleChange} />
      </Option>
      <Option>
        <Label text="Y" />
        <NumberInput
          name="y"
          value={y}
          width={40}
          min={-stageHeight}
          max={stageHeight}
          onChange={handleChange}
        />
        <RangeInput
          name="y"
          value={y}
          min={-stageHeight}
          max={stageHeight}
          onChange={handleChange}
        />
      </Option>
      <Option>
        <Label text="Rotation" />
        <NumberInput
          name="rotation"
          value={rotation}
          width={40}
          min={0}
          max={360}
          onChange={handleChange}
        />
        <RangeInput name="rotation" value={rotation} min={0} max={360} onChange={handleChange} />
      </Option>
      <Option>
        <Label text="Opacity" />
        <ReactorInput name="opacity">
          <NumberInput
            name="opacity"
            value={opacity}
            width={40}
            min={0}
            max={1.0}
            step={0.01}
            onChange={handleChange}
          />
          <RangeInput
            name="opacity"
            value={opacity}
            min={0}
            max={1.0}
            step={0.01}
            onChange={handleChange}
          />
        </ReactorInput>
      </Option>
    </Control>
  );
}

export default DisplayControl(BarSpectrumControl);

import React from 'react';
import { Control, Option } from 'components/editing';
import useEntity from 'components/hooks/useEntity';

export default function WaveSpectrumControl({ display, active, stageWidth, stageHeight }) {
  const {
    maxDecibels,
    minFrequency,
    maxFrequency,
    smoothingTimeConstant,
    width,
    height,
    stroke,
    color,
    fill,
    fillColor,
    taper,
    x,
    y,
    rotation,
    opacity,
  } = display.properties;
  const onChange = useEntity(display);

  return (
    <Control label="Wave Spectrum" active={active} display={display} onChange={onChange}>
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
        step={20}
        withRange
      />
      <Option
        label="Max Frequency"
        type="number"
        name="maxFrequency"
        value={maxFrequency}
        min={minFrequency}
        max={22000}
        step={20}
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
        width={40}
        min={0}
        max={stageHeight}
        value={height}
        withRange
      />
      <Option label="Stroke" type="toggle" name="stroke" value={stroke} />
      <Option label="Stroke Color" type="color" name="color" value={color} />
      <Option label="Fill" type="toggle" name="fill" value={fill} />
      <Option label="Fill Color" type="colorrange" name="fillColor" value={fillColor} />
      <Option label="Taper Edges" type="toggle" name="taper" value={taper} />
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
        withReactor
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
    </Control>
  );
}

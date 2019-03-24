import React, { PureComponent } from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import { NumberInput, ColorRangeInput, RangeInput, ToggleInput, ReactorInput } from 'lib/inputs';

export class BarSpectrumControl extends PureComponent {
  handleChange = (name, value) => {
    const { onChange } = this.props;
    const obj = {};

    if (name === 'barWidthAutoSize') {
      obj.barWidth = value ? -1 : 1;
    } else if (name === 'barSpacingAutoSize') {
      obj.barSpacing = value ? -1 : 1;
    }

    onChange(name, value, obj);
  };

  render() {
    const {
      display,
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
    } = this.props;

    return (
      <Control label="Bar Spectrum" active={active} display={display}>
        <Option>
          <Label text="Max dB" />
          <NumberInput
            name="maxDecibels"
            value={maxDecibels}
            width={40}
            min={-40}
            max={0}
            step={1}
            onChange={this.handleChange}
          />
          <RangeInput
            name="maxDecibels"
            value={maxDecibels}
            min={-40}
            max={0}
            step={1}
            onChange={this.handleChange}
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
            onChange={this.handleChange}
          />
          <RangeInput
            name="minFrequency"
            value={minFrequency}
            min={0}
            max={22000}
            step={10}
            upperLimit={maxFrequency}
            onChange={this.handleChange}
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
            onChange={this.handleChange}
          />
          <RangeInput
            name="maxFrequency"
            value={maxFrequency}
            min={0}
            max={22000}
            step={10}
            lowerLimit={minFrequency}
            onChange={this.handleChange}
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
            onChange={this.handleChange}
          />
          <RangeInput
            name="smoothingTimeConstant"
            value={smoothingTimeConstant}
            min={0}
            max={0.99}
            step={0.01}
            onChange={this.handleChange}
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
            onChange={this.handleChange}
          />
          <RangeInput
            name="width"
            value={width}
            min={0}
            max={stageWidth}
            onChange={this.handleChange}
          />
        </Option>
        <Option>
          <Label text="Height" />
          <NumberInput
            name="height"
            value={height}
            width={40}
            min={0}
            max={stageWidth}
            onChange={this.handleChange}
          />
          <RangeInput
            name="height"
            value={height}
            min={0}
            max={stageWidth}
            onChange={this.handleChange}
          />
        </Option>
        <Option>
          <Label text="Shadow Height" />
          <NumberInput
            name="shadowHeight"
            value={shadowHeight}
            width={40}
            min={0}
            max={stageWidth}
            onChange={this.handleChange}
          />
          <RangeInput
            name="shadowHeight"
            value={shadowHeight}
            min={0}
            max={stageWidth}
            onChange={this.handleChange}
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
            onChange={this.handleChange}
          />
          <Label text="Auto-Size" />
          <ToggleInput
            name="barWidthAutoSize"
            value={barWidthAutoSize}
            onChange={this.handleChange}
          />
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
            onChange={this.handleChange}
          />
          <Label text="Auto-Size" />
          <ToggleInput
            name="barSpacingAutoSize"
            value={barSpacingAutoSize}
            onChange={this.handleChange}
          />
        </Option>
        <Option>
          <Label text="Bar Color" />
          <ColorRangeInput
            name="color"
            startColor={color[0]}
            endColor={color[1]}
            onChange={this.handleChange}
          />
        </Option>
        <Option>
          <Label text="Shadow Color" />
          <ColorRangeInput
            name="shadowColor"
            startColor={shadowColor[0]}
            endColor={shadowColor[1]}
            onChange={this.handleChange}
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
            onChange={this.handleChange}
          />
          <RangeInput
            name="x"
            value={x}
            min={-stageWidth}
            max={stageWidth}
            onChange={this.handleChange}
          />
        </Option>
        <Option>
          <Label text="Y" />
          <NumberInput
            name="y"
            value={y}
            width={40}
            min={-stageHeight}
            max={stageHeight}
            onChange={this.handleChange}
          />
          <RangeInput
            name="y"
            value={y}
            min={-stageHeight}
            max={stageHeight}
            onChange={this.handleChange}
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
            onChange={this.handleChange}
          />
          <RangeInput
            name="rotation"
            value={rotation}
            min={0}
            max={360}
            onChange={this.handleChange}
          />
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
              onChange={this.handleChange}
            />
            <RangeInput
              name="opacity"
              value={opacity}
              min={0}
              max={1.0}
              step={0.01}
              onChange={this.handleChange}
            />
          </ReactorInput>
        </Option>
      </Control>
    );
  }
}

export default DisplayControl(BarSpectrumControl);

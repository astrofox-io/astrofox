import React from 'react';

import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option } from 'components/controls/Control';

import NumberInput from 'components/inputs/NumberInput';
import ColorRangeInput from 'components/inputs/ColorRangeInput';
import RangeInput from 'components/inputs/RangeInput';
import ToggleInput from 'components/inputs/ToggleInput';

export class BarSpectrumControl extends React.Component {
    constructor(props) {
        super(props);
    }

    onChange = (name, value) => {
        const obj = {};

        if (name === 'barWidthAutoSize') {
            obj.barWidth = value ? -1 : 1;
        }
        else if (name === 'barSpacingAutoSize') {
            obj.barSpacing = value ? -1 : 1;
        }

        this.props.onChange(name, value, obj);
    };

    render() {
        const {
            active, stageWidth, stageHeight,
            maxDecibels, minFrequency, maxFrequency, smoothingTimeConstant,
            width, height, shadowHeight, barWidth, barWidthAutoSize, barSpacing, barSpacingAutoSize,
            x, y, color, shadowColor, rotation, opacity
        } = this.props;

        return (
            <Control label="BAR SPECTRUM" active={active}>
                <Option label="Max dB">
                    <NumberInput
                        name="maxDecibels"
                        value={maxDecibels}
                        width={40}
                        min={-40}
                        max={0}
                        step={1}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="maxDecibels"
                        value={maxDecibels}
                        min={-40}
                        max={0}
                        step={1}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Min Frequency">
                    <NumberInput
                        name="minFrequency"
                        value={minFrequency}
                        width={40}
                        min={0}
                        max={maxFrequency}
                        step={10}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="minFrequency"
                        value={minFrequency}
                        min={0}
                        max={22000}
                        step={10}
                        upperLimit={maxFrequency}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Max Frequency">
                    <NumberInput
                        name="maxFrequency"
                        value={maxFrequency}
                        width={40}
                        min={minFrequency}
                        max={22000}
                        step={10}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="maxFrequency"
                        value={maxFrequency}
                        min={0}
                        max={22000}
                        step={10}
                        lowerLimit={minFrequency}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Smoothing">
                    <NumberInput
                        name="smoothingTimeConstant"
                        value={smoothingTimeConstant}
                        width={40}
                        min={0}
                        max={0.99}
                        step={0.01}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="smoothingTimeConstant"
                        value={smoothingTimeConstant}
                        min={0}
                        max={0.99}
                        step={0.01}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Width">
                    <NumberInput
                        name="width"
                        value={width}
                        width={40}
                        min={0}
                        max={stageWidth}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="width"
                        value={width}
                        min={0}
                        max={stageWidth}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Height">
                    <NumberInput
                        name="height"
                        value={height}
                        width={40}
                        min={0}
                        max={stageWidth}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="height"
                        value={height}
                        min={0}
                        max={stageWidth}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Shadow Height">
                    <NumberInput
                        name="shadowHeight"
                        value={shadowHeight}
                        width={40}
                        min={0}
                        max={stageWidth}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="shadowHeight"
                        value={shadowHeight}
                        min={0}
                        max={stageWidth}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Bar Width">
                    <NumberInput
                        name="barWidth"
                        value={barWidth}
                        width={40}
                        min={-1}
                        max={stageWidth}
                        readOnly={barWidthAutoSize}
                        hidden={barWidthAutoSize}
                        onChange={this.onChange}
                    />
                    <span className="label">Auto-Size</span>
                    <ToggleInput
                        name="barWidthAutoSize"
                        value={barWidthAutoSize}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Bar Spacing">
                    <NumberInput
                        name="barSpacing"
                        value={barSpacing}
                        width={40}
                        min={-1}
                        max={stageWidth}
                        readOnly={barSpacingAutoSize}
                        hidden={barSpacingAutoSize}
                        onChange={this.onChange}
                    />
                    <span className="label">Auto-Size</span>
                    <ToggleInput
                        name="barSpacingAutoSize"
                        value={barSpacingAutoSize}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Bar Color">
                    <ColorRangeInput
                        name="color"
                        startColor={color[0]}
                        endColor={color[1]}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Shadow Color">
                    <ColorRangeInput
                        name="shadowColor"
                        startColor={shadowColor[0]}
                        endColor={shadowColor[1]}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="X">
                    <NumberInput
                        name="x"
                        value={x}
                        width={40}
                        min={-stageWidth}
                        max={stageWidth}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="x"
                        value={x}
                        min={-stageWidth}
                        max={stageWidth}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Y">
                    <NumberInput
                        name="y"
                        value={y}
                        width={40}
                        min={-stageHeight}
                        max={stageHeight}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="y"
                        value={y}
                        min={-stageHeight}
                        max={stageHeight}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Rotation">
                    <NumberInput
                        name="rotation"
                        value={rotation}
                        width={40}
                        min={0}
                        max={360}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="rotation"
                        value={rotation}
                        min={0}
                        max={360}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Opacity">
                    <NumberInput
                        name="opacity"
                        value={opacity}
                        width={40}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="opacity"
                        value={opacity}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={this.onChange}
                    />
                </Option>
            </Control>
        );
    }
}

export default DisplayControl(BarSpectrumControl);
import React from 'react';

import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option } from 'components/controls/Control';

import NumberInput from 'components/inputs/NumberInput';
import ColorInput from 'components/inputs/ColorInput';
import ColorRangeInput from 'components/inputs/ColorRangeInput';
import RangeInput from 'components/inputs/RangeInput';
import ToggleInput from 'components/inputs/ToggleInput';

export class WaveSpectrumControl extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { 
            active, stageWidth, stageHeight, onChange,
            maxDecibels, minFrequency, maxFrequency, smoothingTimeConstant, width, height,
            stroke, color, fill, fillColor, taper, x, y, rotation, opacity
        } = this.props;

        return (
            <Control label="WAVE SPECTRUM" active={active}>
                <Option label="Max dB">
                    <NumberInput
                        name="maxDecibels"
                        width={40}
                        value={maxDecibels}
                        min={-40}
                        max={0}
                        step={1}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="maxDecibels"
                        min={-40}
                        max={0}
                        step={1}
                        value={maxDecibels}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Min Frequency">
                    <NumberInput
                        name="minFrequency"
                        width={40}
                        value={minFrequency}
                        min={0}
                        max={maxFrequency}
                        step={20}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="minFrequency"
                        min={60}
                        max={22000}
                        step={20}
                        upperLimit={maxFrequency}
                        value={minFrequency}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Max Frequency">
                    <NumberInput
                        name="maxFrequency"
                        width={40}
                        value={maxFrequency}
                        min={minFrequency}
                        max={22000}
                        step={20}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="maxFrequency"
                        min={60}
                        max={22000}
                        step={20}
                        lowerLimit={minFrequency}
                        value={maxFrequency}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Smoothing">
                    <NumberInput
                        name="smoothingTimeConstant"
                        width={40}
                        value={smoothingTimeConstant}
                        min={0}
                        max={0.99}
                        step={0.01}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="smoothingTimeConstant"
                        min={0}
                        max={0.99}
                        step={0.01}
                        value={smoothingTimeConstant}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Width">
                    <NumberInput
                        name="width"
                        width={40}
                        value={width}
                        min={0}
                        max={stageWidth}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="width"
                        min={0}
                        max={stageWidth}
                        value={width}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Height">
                    <NumberInput
                        name="height"
                        width={40}
                        min={0}
                        max={stageWidth}
                        value={height}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="height"
                        min={0}
                        max={stageWidth}
                        value={height}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Stroke">
                    <ToggleInput
                        name="stroke"
                        value={stroke}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Stroke Color">
                    <ColorInput
                        name="color"
                        value={color}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Fill">
                    <ToggleInput
                        name="fill"
                        value={fill}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Fill Color">
                    <ColorRangeInput
                        name="fillColor"
                        startColor={fillColor[0]}
                        endColor={fillColor[1]}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Taper Edges">
                    <ToggleInput
                        name="taper"
                        value={taper}
                        onChange={onChange}
                    />
                </Option>
                <Option label="X">
                    <NumberInput
                        name="x"
                        width={40}
                        min={-stageWidth}
                        max={stageWidth}
                        value={x}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="x"
                        min={-stageWidth}
                        max={stageWidth}
                        value={x}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Y">
                    <NumberInput
                        name="y"
                        width={40}
                        min={-stageHeight}
                        max={stageHeight}
                        value={y}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="y"
                        min={-stageHeight}
                        max={stageHeight}
                        value={y}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Rotation">
                    <NumberInput
                        name="rotation"
                        width={40}
                        min={0}
                        max={360}
                        value={rotation}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="rotation"
                        min={0}
                        max={360}
                        value={rotation}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Opacity">
                    <NumberInput
                        name="opacity"
                        width={40}
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={opacity}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="opacity"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={opacity}
                        onChange={onChange}
                    />
                </Option>
            </Control>
        );
    }
}

export default DisplayControl(WaveSpectrumControl);
import React from 'react';

import UIPureComponent from 'components/UIPureComponent';
import NumberInput from 'components/inputs/NumberInput';
import ColorInput from 'components/inputs/ColorInput';
import ColorRangeInput from 'components/inputs/ColorRangeInput';
import RangeInput from 'components/inputs/RangeInput';
import ToggleInput from 'components/inputs/ToggleInput';
import { Control, Option } from 'components/controls/Control';

export default class WaveSpectrumControl extends UIPureComponent {
    constructor(props) {
        super(props);

        this.state = this.props.display.options;
    }

    onChange(name, val) {
        let obj = {},
            display = this.props.display;

        obj[name] = val;

        this.setState(obj, () => {
            display.update(obj);
        });
    }

    render() {
        const { active, stageWidth, stageHeight } = this.props,
            state = this.state;

        return (
            <Control label="WAVE SPECTRUM" active={active}>
                <Option label="Max dB">
                    <NumberInput
                        name="maxDecibels"
                        width={40}
                        value={state.maxDecibels}
                        min={-40}
                        max={0}
                        step={1}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="maxDecibels"
                        min={-40}
                        max={0}
                        step={1}
                        value={state.maxDecibels}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Min Frequency">
                    <NumberInput
                        name="minFrequency"
                        width={40}
                        value={state.minFrequency}
                        min={0}
                        max={state.maxFrequency}
                        step={20}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="minFrequency"
                        min={60}
                        max={22000}
                        step={20}
                        upperLimit={state.maxFrequency}
                        value={state.minFrequency}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Max Frequency">
                    <NumberInput
                        name="maxFrequency"
                        width={40}
                        value={state.maxFrequency}
                        min={state.minFrequency}
                        max={22000}
                        step={20}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="maxFrequency"
                        min={60}
                        max={22000}
                        step={20}
                        lowerLimit={state.minFrequency}
                        value={state.maxFrequency}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Smoothing">
                    <NumberInput
                        name="smoothingTimeConstant"
                        width={40}
                        value={state.smoothingTimeConstant}
                        min={0}
                        max={0.99}
                        step={0.01}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="smoothingTimeConstant"
                        min={0}
                        max={0.99}
                        step={0.01}
                        value={state.smoothingTimeConstant}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Width">
                    <NumberInput
                        name="width"
                        width={40}
                        value={state.width}
                        min={0}
                        max={stageWidth}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="width"
                        min={0}
                        max={stageWidth}
                        value={state.width}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Height">
                    <NumberInput
                        name="height"
                        width={40}
                        min={0}
                        max={stageWidth}
                        value={state.height}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="height"
                        min={0}
                        max={stageWidth}
                        value={state.height}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Stroke">
                    <ToggleInput
                        name="stroke"
                        value={state.stroke}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Stroke Color">
                    <ColorInput
                        name="color"
                        value={state.color}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Fill">
                    <ToggleInput
                        name="fill"
                        value={state.fill}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Fill Color">
                    <ColorRangeInput
                        name="fillColor"
                        startColor={state.fillColor[0]}
                        endColor={state.fillColor[1]}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Taper Edges">
                    <ToggleInput
                        name="taper"
                        value={state.taper}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="X">
                    <NumberInput
                        name="x"
                        width={40}
                        min={-stageWidth}
                        max={stageWidth}
                        value={state.x}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="x"
                        min={-stageWidth}
                        max={stageWidth}
                        value={state.x}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Y">
                    <NumberInput
                        name="y"
                        width={40}
                        min={-stageHeight}
                        max={stageHeight}
                        value={state.y}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="y"
                        min={-stageHeight}
                        max={stageHeight}
                        value={state.y}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Rotation">
                    <NumberInput
                        name="rotation"
                        width={40}
                        min={0}
                        max={360}
                        value={state.rotation}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="rotation"
                        min={0}
                        max={360}
                        value={state.rotation}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Opacity">
                    <NumberInput
                        name="opacity"
                        width={40}
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={state.opacity}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="opacity"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={state.opacity}
                        onChange={this.onChange}
                    />
                </Option>
            </Control>
        );
    }
}
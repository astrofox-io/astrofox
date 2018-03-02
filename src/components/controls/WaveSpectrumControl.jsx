import React, { PureComponent } from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import {
    NumberInput,
    ColorInput,
    ColorRangeInput,
    RangeInput,
    ToggleInput,
    ReactorInput,
} from 'lib/inputs';

export class WaveSpectrumControl extends PureComponent {
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
            stroke,
            color,
            fill,
            fillColor,
            taper,
            x,
            y,
            rotation,
            opacity,
            onChange,
        } = this.props;

        return (
            <Control
                label="Wave Spectrum"
                active={active}
                display={display}
            >
                <Option>
                    <Label text="Max dB" />
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
                <Option>
                    <Label text="Min Frequency" />
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
                <Option>
                    <Label text="Max Frequency" />
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
                <Option>
                    <Label text="Smoothing" />
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
                <Option>
                    <Label text="Width" />
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
                <Option>
                    <Label text="Height" />
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
                <Option>
                    <Label text="Stroke" />
                    <ToggleInput
                        name="stroke"
                        value={stroke}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="Stroke Color" />
                    <ColorInput
                        name="color"
                        value={color}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="Fill" />
                    <ToggleInput
                        name="fill"
                        value={fill}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="Fill Color" />
                    <ColorRangeInput
                        name="fillColor"
                        startColor={fillColor[0]}
                        endColor={fillColor[1]}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="Taper Edges" />
                    <ToggleInput
                        name="taper"
                        value={taper}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="X" />
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
                <Option>
                    <Label text="Y" />
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
                <Option>
                    <Label text="Rotation" />
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
                <Option>
                    <Label text="Opacity" />
                    <ReactorInput name="opacity">
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
                    </ReactorInput>
                </Option>
            </Control>
        );
    }
}

export default DisplayControl(WaveSpectrumControl);

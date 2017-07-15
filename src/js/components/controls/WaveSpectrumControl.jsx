import React from 'react';

import UIPureComponent from '../UIPureComponent';
import NumberInput from '../inputs/NumberInput';
import ColorInput from '../inputs/ColorInput';
import ColorRangeInput from '../inputs/ColorRangeInput';
import RangeInput from '../inputs/RangeInput';
import ToggleInput from '../inputs/ToggleInput';
import { Control, Row } from './Control';

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
                <Row label="Max dB">
                    <NumberInput
                        name="maxDecibels"
                        width={40}
                        value={state.maxDecibels}
                        min={-40}
                        max={0}
                        step={1}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="maxDecibels"
                            min={-40}
                            max={0}
                            step={1}
                            value={state.maxDecibels}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Min Frequency">
                    <NumberInput
                        name="minFrequency"
                        width={40}
                        value={state.minFrequency}
                        min={0}
                        max={state.maxFrequency}
                        step={20}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="minFrequency"
                            min={60}
                            max={22000}
                            step={20}
                            upperLimit={state.maxFrequency}
                            value={state.minFrequency}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Max Frequency">
                    <NumberInput
                        name="maxFrequency"
                        width={40}
                        value={state.maxFrequency}
                        min={state.minFrequency}
                        max={22000}
                        step={20}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="maxFrequency"
                            min={60}
                            max={22000}
                            step={20}
                            lowerLimit={state.minFrequency}
                            value={state.maxFrequency}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Smoothing">
                    <NumberInput
                        name="smoothingTimeConstant"
                        width={40}
                        value={state.smoothingTimeConstant}
                        min={0}
                        max={0.99}
                        step={0.01}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="smoothingTimeConstant"
                            min={0}
                            max={0.99}
                            step={0.01}
                            value={state.smoothingTimeConstant}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Width">
                    <NumberInput
                        name="width"
                        width={40}
                        value={state.width}
                        min={0}
                        max={stageWidth}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="width"
                            min={0}
                            max={stageWidth}
                            value={state.width}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Height">
                    <NumberInput
                        name="height"
                        width={40}
                        min={0}
                        max={stageWidth}
                        value={state.height}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="height"
                            min={0}
                            max={stageWidth}
                            value={state.height}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Stroke">
                    <ToggleInput
                        name="stroke"
                        value={state.stroke}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Stroke Color">
                    <ColorInput
                        name="color"
                        value={state.color}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Fill">
                    <ToggleInput
                        name="fill"
                        value={state.fill}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Fill Color">
                    <ColorRangeInput
                        name="fillColor"
                        startColor={state.fillColor[0]}
                        endColor={state.fillColor[1]}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Taper Edges">
                    <ToggleInput
                        name="taper"
                        value={state.taper}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="X">
                    <NumberInput
                        name="x"
                        width={40}
                        min={-stageWidth}
                        max={stageWidth}
                        value={state.x}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-stageWidth}
                            max={stageWidth}
                            value={state.x}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Y">
                    <NumberInput
                        name="y"
                        width={40}
                        min={-stageHeight}
                        max={stageHeight}
                        value={state.y}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-stageHeight}
                            max={stageHeight}
                            value={state.y}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Rotation">
                    <NumberInput
                        name="rotation"
                        width={40}
                        min={0}
                        max={360}
                        value={state.rotation}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="rotation"
                            min={0}
                            max={360}
                            value={state.rotation}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Opacity">
                    <NumberInput
                        name="opacity"
                        width={40}
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={state.opacity}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={state.opacity}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}
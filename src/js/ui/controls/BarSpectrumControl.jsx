import React from 'react';

import UIPureComponent from '../UIPureComponent';
import NumberInput from '../inputs/NumberInput';
import ColorRangeInput from '../inputs/ColorRangeInput';
import RangeInput from '../inputs/RangeInput';
import ToggleInput from '../inputs/ToggleInput';
import { Control, Row } from './Control';

export default class BarSpectrumControl extends UIPureComponent {
    constructor(props) {
        super(props);
        
        this.state = this.props.display.options;
    }

    onChange(name, val) {
        let obj = {},
            display = this.props.display;

        if (name === 'barWidthAutoSize') {
            obj.barWidth = (val) ? -1 : 1;
        }
        else if (name === 'barSpacingAutoSize') {
            obj.barSpacing = (val) ? -1 : 1;
        }

        obj[name] = val;

        this.setState(obj, () => {
            display.update(obj);
        });
    }

    render() {
        let maxFrequency = 22000,
            maxHeight = 480,
            maxWidth = 854;

        return (
            <Control label="BAR SPECTRUM" className={this.props.className}>
                <Row label="Max dB">
                    <NumberInput
                        name="maxDecibels"
                        width={40}
                        value={this.state.maxDecibels}
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
                            value={this.state.maxDecibels}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Max Frequency">
                    <NumberInput
                        name="maxFrequency"
                        width={40}
                        value={this.state.maxFrequency}
                        min={0}
                        max={maxFrequency}
                        step={20}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="maxFrequency"
                            min={100}
                            max={maxFrequency}
                            step={20}
                            value={this.state.maxFrequency}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Smoothing">
                    <NumberInput
                        name="smoothingTimeConstant"
                        width={40}
                        value={this.state.smoothingTimeConstant}
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
                            value={this.state.smoothingTimeConstant}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Width">
                    <NumberInput
                        name="width"
                        width={40}
                        value={this.state.width}
                        min={0}
                        max={maxWidth}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="width"
                            min={0}
                            max={maxWidth}
                            value={this.state.width}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Height">
                    <NumberInput
                        name="height"
                        width={40}
                        min={0}
                        max={maxWidth}
                        value={this.state.height}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="height"
                            min={0}
                            max={maxWidth}
                            value={this.state.height}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Shadow Height">
                    <NumberInput
                        name="shadowHeight"
                        width={40}
                        min={0}
                        max={maxWidth}
                        value={this.state.shadowHeight}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="shadowHeight"
                            min={0}
                            max={maxWidth}
                            value={this.state.shadowHeight}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Bar Width">
                    <NumberInput
                        name="barWidth"
                        width={40}
                        min={-1}
                        max={maxWidth}
                        value={this.state.barWidth}
                        readOnly={this.state.barWidthAutoSize}
                        hidden={this.state.barWidthAutoSize}
                        onChange={this.onChange}
                    />
                    <span className="label">Auto-Size</span>
                    <ToggleInput
                        name="barWidthAutoSize"
                        value={this.state.barWidthAutoSize}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Bar Spacing">
                    <NumberInput
                        name="barSpacing"
                        width={40}
                        min={-1}
                        max={maxWidth}
                        value={this.state.barSpacing}
                        readOnly={this.state.barSpacingAutoSize}
                        hidden={this.state.barSpacingAutoSize}
                        onChange={this.onChange}
                    />
                    <span className="label">Auto-Size</span>
                    <ToggleInput
                        name="barSpacingAutoSize"
                        value={this.state.barSpacingAutoSize}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Bar Color">
                    <ColorRangeInput
                        name="color"
                        startColor={this.state.color[0]}
                        endColor={this.state.color[1]}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Shadow Color">
                    <ColorRangeInput
                        name="shadowColor"
                        startColor={this.state.shadowColor[0]}
                        endColor={this.state.shadowColor[1]}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="X">
                    <NumberInput
                        name="x"
                        width={40}
                        min={-maxWidth}
                        max={maxWidth}
                        value={this.state.x}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-maxWidth}
                            max={maxWidth}
                            value={this.state.x}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Y">
                    <NumberInput
                        name="y"
                        width={40}
                        min={-maxHeight}
                        max={maxHeight}
                        value={this.state.y}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-maxHeight}
                            max={maxHeight}
                            value={this.state.y}
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
                        value={this.state.rotation}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="rotation"
                            min={0}
                            max={360}
                            value={this.state.rotation}
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
                        value={this.state.opacity}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={this.state.opacity}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}
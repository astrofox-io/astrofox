import React from 'react';

import UIPureComponent from 'components/UIPureComponent';
import NumberInput from 'components/inputs/NumberInput';
import ColorRangeInput from 'components/inputs/ColorRangeInput';
import RangeInput from 'components/inputs/RangeInput';
import ToggleInput from 'components/inputs/ToggleInput';
import { Control, Row } from 'components/controls/Control';

export default class BarSpectrumControl extends UIPureComponent {
    constructor(props) {
        super(props);
        
        this.state = this.props.display.options;
    }

    onChange(name, val) {
        let obj = {},
            display = this.props.display;

        if (name === 'barWidthAutoSize') {
            obj.barWidth = val ? -1 : 1;
        }
        else if (name === 'barSpacingAutoSize') {
            obj.barSpacing = val ? -1 : 1;
        }

        obj[name] = val;

        this.setState(obj, () => {
            display.update(obj);
        });
    }

    render() {
        const { active, stageWidth, stageHeight } = this.props,
            state = this.state;

        return (
            <Control label="BAR SPECTRUM" active={active}>
                <Row label="Max dB">
                    <NumberInput
                        name="maxDecibels"
                        value={state.maxDecibels}
                        width={40}
                        min={-40}
                        max={0}
                        step={1}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="maxDecibels"
                            value={state.maxDecibels}
                            min={-40}
                            max={0}
                            step={1}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Min Frequency">
                    <NumberInput
                        name="minFrequency"
                        value={state.minFrequency}
                        width={40}
                        min={0}
                        max={state.maxFrequency}
                        step={10}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="minFrequency"
                            value={state.minFrequency}
                            min={0}
                            max={22000}
                            step={10}
                            upperLimit={state.maxFrequency}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Max Frequency">
                    <NumberInput
                        name="maxFrequency"
                        value={state.maxFrequency}
                        width={40}
                        min={state.minFrequency}
                        max={22000}
                        step={10}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="maxFrequency"
                            value={state.maxFrequency}
                            min={0}
                            max={22000}
                            step={10}
                            lowerLimit={state.minFrequency}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Smoothing">
                    <NumberInput
                        name="smoothingTimeConstant"
                        value={state.smoothingTimeConstant}
                        width={40}
                        min={0}
                        max={0.99}
                        step={0.01}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="smoothingTimeConstant"
                            value={state.smoothingTimeConstant}
                            min={0}
                            max={0.99}
                            step={0.01}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Width">
                    <NumberInput
                        name="width"
                        value={state.width}
                        width={40}
                        min={0}
                        max={stageWidth}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="width"
                            value={state.width}
                            min={0}
                            max={stageWidth}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Height">
                    <NumberInput
                        name="height"
                        value={state.height}
                        width={40}
                        min={0}
                        max={stageWidth}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="height"
                            value={state.height}
                            min={0}
                            max={stageWidth}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Shadow Height">
                    <NumberInput
                        name="shadowHeight"
                        value={state.shadowHeight}
                        width={40}
                        min={0}
                        max={stageWidth}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="shadowHeight"
                            value={state.shadowHeight}
                            min={0}
                            max={stageWidth}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Bar Width">
                    <NumberInput
                        name="barWidth"
                        value={state.barWidth}
                        width={40}
                        min={-1}
                        max={stageWidth}
                        readOnly={state.barWidthAutoSize}
                        hidden={state.barWidthAutoSize}
                        onChange={this.onChange}
                    />
                    <span className="label">Auto-Size</span>
                    <ToggleInput
                        name="barWidthAutoSize"
                        value={state.barWidthAutoSize}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Bar Spacing">
                    <NumberInput
                        name="barSpacing"
                        value={state.barSpacing}
                        width={40}
                        min={-1}
                        max={stageWidth}
                        readOnly={state.barSpacingAutoSize}
                        hidden={state.barSpacingAutoSize}
                        onChange={this.onChange}
                    />
                    <span className="label">Auto-Size</span>
                    <ToggleInput
                        name="barSpacingAutoSize"
                        value={state.barSpacingAutoSize}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Bar Color">
                    <ColorRangeInput
                        name="color"
                        startColor={state.color[0]}
                        endColor={state.color[1]}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Shadow Color">
                    <ColorRangeInput
                        name="shadowColor"
                        startColor={state.shadowColor[0]}
                        endColor={state.shadowColor[1]}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="X">
                    <NumberInput
                        name="x"
                        value={state.x}
                        width={40}
                        min={-stageWidth}
                        max={stageWidth}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            value={state.x}
                            min={-stageWidth}
                            max={stageWidth}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Y">
                    <NumberInput
                        name="y"
                        value={state.y}
                        width={40}
                        min={-stageHeight}
                        max={stageHeight}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            value={state.y}
                            min={-stageHeight}
                            max={stageHeight}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Rotation">
                    <NumberInput
                        name="rotation"
                        value={state.rotation}
                        width={40}
                        min={0}
                        max={360}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="rotation"
                            value={state.rotation}
                            min={0}
                            max={360}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Opacity">
                    <NumberInput
                        name="opacity"
                        value={state.opacity}
                        width={40}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            value={state.opacity}
                            min={0}
                            max={1.0}
                            step={0.01}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}
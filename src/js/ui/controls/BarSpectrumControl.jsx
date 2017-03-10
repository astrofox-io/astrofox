import React from 'react';

import UIPureComponent from '../UIPureComponent';
import NumberInput from '../inputs/NumberInput';
import ColorRangeInput from '../inputs/ColorRangeInput';
import RangeInput from '../inputs/RangeInput';
import ToggleInput from '../inputs/ToggleInput';
import { Control, Row } from './Control';

export default class BarSpectrumControl extends UIPureComponent {
    constructor(props, context) {
        super(props);
        
        this.state = this.props.display.options;

        this.app = context.app;
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
        const { width, height } = this.app.stage.getSize();

        return (
            <Control label="BAR SPECTRUM" className={this.props.className}>
                <Row label="Max dB">
                    <NumberInput
                        name="maxDecibels"
                        value={this.state.maxDecibels}
                        width={40}
                        min={-40}
                        max={0}
                        step={1}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="maxDecibels"
                            value={this.state.maxDecibels}
                            min={-40}
                            max={0}
                            step={1}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Max Frequency">
                    <NumberInput
                        name="maxFrequency"
                        value={this.state.maxFrequency}
                        width={40}
                        min={60}
                        max={22000}
                        step={10}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="maxFrequency"
                            value={this.state.maxFrequency}
                            min={60}
                            max={22000}
                            step={10}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Smoothing">
                    <NumberInput
                        name="smoothingTimeConstant"
                        value={this.state.smoothingTimeConstant}
                        width={40}
                        min={0}
                        max={0.99}
                        step={0.01}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="smoothingTimeConstant"
                            value={this.state.smoothingTimeConstant}
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
                        value={this.state.width}
                        width={40}
                        min={0}
                        max={width}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="width"
                            value={this.state.width}
                            min={0}
                            max={width}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Height">
                    <NumberInput
                        name="height"
                        value={this.state.height}
                        width={40}
                        min={0}
                        max={width}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="height"
                            value={this.state.height}
                            min={0}
                            max={width}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Shadow Height">
                    <NumberInput
                        name="shadowHeight"
                        value={this.state.shadowHeight}
                        width={40}
                        min={0}
                        max={width}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="shadowHeight"
                            value={this.state.shadowHeight}
                            min={0}
                            max={width}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Bar Width">
                    <NumberInput
                        name="barWidth"
                        value={this.state.barWidth}
                        width={40}
                        min={-1}
                        max={width}
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
                        value={this.state.barSpacing}
                        width={40}
                        min={-1}
                        max={width}
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
                        value={this.state.x}
                        width={40}
                        min={-width}
                        max={width}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            value={this.state.x}
                            min={-width}
                            max={width}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Y">
                    <NumberInput
                        name="y"
                        value={this.state.y}
                        width={40}
                        min={-height}
                        max={height}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            value={this.state.y}
                            min={-height}
                            max={height}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Rotation">
                    <NumberInput
                        name="rotation"
                        value={this.state.rotation}
                        width={40}
                        min={0}
                        max={360}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="rotation"
                            value={this.state.rotation}
                            min={0}
                            max={360}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Opacity">
                    <NumberInput
                        name="opacity"
                        value={this.state.opacity}
                        width={40}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            value={this.state.opacity}
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

BarSpectrumControl.contextTypes = {
    app: React.PropTypes.object
};
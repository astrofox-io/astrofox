import React from 'react';

import UIComponent from '../UIComponent';
import NumberInput from '../inputs/NumberInput';
import ColorInput from '../inputs/ColorInput';
import RangeInput from '../inputs/RangeInput';
import ToggleInput from '../inputs/ToggleInput';
import { Control, Row } from './Control';

export default class SoundwaveControl extends UIComponent {
    constructor(props, context) {
        super(props);

        this.state = this.props.display.options;

        this.app = context.app;
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
        const { width, height } = this.app.stage.getSize(),
            state = this.state;

        return (
            <Control label="SOUNDWAVE" className={this.props.className}>
                <Row label="Color">
                    <ColorInput
                        name="color"
                        value={state.color}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Line Width">
                    <NumberInput
                        name="lineWidth"
                        width={40}
                        value={state.lineWidth}
                        min={0}
                        max={10}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="lineWidth"
                            min={0.01}
                            max={10}
                            step={0.01}
                            value={state.lineWidth}
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
                        max={width}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="width"
                            min={0}
                            max={width}
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
                        max={width}
                        value={state.height}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="height"
                            min={0}
                            max={width}
                            value={state.height}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="X">
                    <NumberInput
                        name="x"
                        width={40}
                        min={-width}
                        max={width}
                        value={state.x}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-width}
                            max={width}
                            value={state.x}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Y">
                    <NumberInput
                        name="y"
                        width={40}
                        min={-height}
                        max={height}
                        value={state.y}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-height}
                            max={height}
                            value={state.y}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Wavelength">
                    <NumberInput
                        name="length"
                        width={40}
                        min={0}
                        max={100}
                        step={1}
                        value={state.length}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="length"
                            min={0}
                            max={100}
                            step={1}
                            value={state.length}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Smooth">
                    <ToggleInput
                        name="smooth"
                        value={state.smooth}
                        onChange={this.onChange}
                    />
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

SoundwaveControl.contextTypes = {
    app: React.PropTypes.object
};
import React from 'react';

import UIPureComponent from '../UIPureComponent';
import NumberInput from '../inputs/NumberInput';
import ColorInput from '../inputs/ColorInput';
import RangeInput from '../inputs/RangeInput';
import ToggleInput from '../inputs/ToggleInput';
import { Control, Row } from './Control';

export default class SoundwaveControl extends UIPureComponent {
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
        let maxHeight = 480;
        let maxWidth = 854;

        return (
            <Control label="SOUNDWAVE" className={this.props.className}>
                <Row label="Color">
                    <ColorInput
                        name="color"
                        value={this.state.color}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Line Width">
                    <NumberInput
                        name="lineWidth"
                        width={40}
                        value={this.state.lineWidth}
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
                            value={this.state.lineWidth}
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
                <Row label="Wavelength">
                    <NumberInput
                        name="length"
                        width={40}
                        min={0}
                        max={100}
                        step={1}
                        value={this.state.length}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="length"
                            min={0}
                            max={100}
                            step={1}
                            value={this.state.length}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Smooth">
                    <ToggleInput
                        name="smooth"
                        value={this.state.smooth}
                        onChange={this.onChange}
                    />
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
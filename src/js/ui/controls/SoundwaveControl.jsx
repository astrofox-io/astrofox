'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const NumberInput = require('../inputs/NumberInput.jsx');
const ColorInput = require('../inputs/ColorInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const ToggleInput = require('../inputs/ToggleInput.jsx');
const { Control, Row } = require('./Control.jsx');

class SoundwaveControl extends UIComponent {
    constructor(props) {
        super(props);

        this.state = this.props.display.options;
        this.shouldUpdate = false;
    }

    componentDidUpdate() {
        this.shouldUpdate = false;
    }

    shouldComponentUpdate() {
        return this.shouldUpdate;
    }

    onChange(name, val) {
        let obj = {},
            display = this.props.display;

        obj[name] = val;

        this.shouldUpdate = true;

        this.setState(obj, () => {
            display.update(obj);
        });
    }

    render() {
        let maxHeight = 480;
        let maxWidth = 854;

        return (
            <Control titel="SOUNDWAVE">
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
                        size="3"
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
                        size="3"
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
                        size="3"
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
                        size="3"
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
                        size="3"
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
                        size="3"
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
                        size="3"
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
                        size="3"
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

module.exports = SoundwaveControl;
'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const { Control, Row } = require('./Control.jsx');

const OFFSET_MAX = 854;

class RGBShiftControl extends UIComponent {
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
        return (
            <Control title="RGB SHIFT">
                <Row label="Offset">
                    <NumberInput
                        name="offset"
                        size="3"
                        value={this.state.offset}
                        min={0}
                        max={OFFSET_MAX}
                        step={1}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="offset"
                            min={0.0}
                            max={OFFSET_MAX}
                            step={1}
                            value={this.state.offset}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Angle">
                    <NumberInput
                        name="angle"
                        size="3"
                        value={this.state.angle}
                        min={0}
                        max={360}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="angle"
                            min={0}
                            max={360}
                            value={this.state.angle}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}

module.exports = RGBShiftControl;
'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const { Control, Row } = require('./Control.jsx');

class GlowControl extends UIComponent {
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
            <Control label="GLOW" className={this.props.className}>
                <Row label="Amount">
                    <NumberInput
                        name="amount"
                        width={40}
                        value={this.state.amount}
                        min={0}
                        step={0.01}
                        max={1}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="amount"
                            min={0}
                            step={0.01}
                            max={1}
                            value={this.state.amount}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Intensity">
                    <NumberInput
                        name="intensity"
                        width={40}
                        value={this.state.intensity}
                        min={1}
                        step={0.01}
                        max={3}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="intensity"
                            min={1}
                            step={0.01}
                            max={3}
                            value={this.state.intensity}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}

module.exports = GlowControl;
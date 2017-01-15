'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const { Control, Row } = require('./Control.jsx');

class DotScreenControl extends UIComponent {
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
            display.update(this.state);
        });
    }

    render() {
        return (
            <Control label="DOT SCREEN" className={this.props.className}>
                <Row label="Amount">
                    <NumberInput
                        name="scale"
                        width={40}
                        value={this.state.scale}
                        min={0}
                        max={2.0}
                        step={0.01}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="scale"
                            min={0.0}
                            max={2.0}
                            step={0.01}
                            value={this.state.scale}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Angle">
                    <NumberInput
                        name="angle"
                        width={40}
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

module.exports = DotScreenControl;
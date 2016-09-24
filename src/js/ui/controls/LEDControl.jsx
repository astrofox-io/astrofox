'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const { Control, Row } = require('./Control.jsx');

class LEDControl extends UIComponent {
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
            <Control title="LED">
                <Row label="Spacing">
                    <NumberInput
                        name="spacing"
                        width={40}
                        value={this.state.spacing}
                        min={1}
                        max={100}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="spacing"
                            min={1}
                            max={100}
                            value={this.state.spacing}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Size">
                    <NumberInput
                        name="size"
                        width={40}
                        value={this.state.size}
                        min={0}
                        max={100}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="size"
                            min={0}
                            max={100}
                            value={this.state.size}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Blur">
                    <NumberInput
                        name="blur"
                        width={40}
                        value={this.state.blur}
                        min={0}
                        max={100}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="blur"
                            min={0}
                            max={100}
                            value={this.state.blur}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}

module.exports = LEDControl;
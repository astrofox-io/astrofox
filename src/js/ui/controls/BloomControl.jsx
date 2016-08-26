'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const SelectInput = require('../inputs/SelectInput.jsx');

const blendModes = [
    'Add',
    'Screen'
];

class BloomControl extends UIComponent {
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
            <div className="control">
                <div className="header">BLOOM</div>
                <div className="row">
                    <span className="label">Blend Mode</span>
                    <SelectInput
                        name="blendMode"
                        size="20"
                        items={blendModes}
                        value={this.state.blendMode}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <span className="label">Amount</span>
                    <NumberInput
                        name="amount"
                        size="3"
                        value={this.state.amount}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="amount"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={this.state.amount}
                            onChange={this.onChange} />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Threshold</span>
                    <NumberInput
                        name="threshold"
                        size="3"
                        value={this.state.threshold}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="threshold"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={this.state.threshold}
                            onChange={this.onChange} />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = BloomControl;
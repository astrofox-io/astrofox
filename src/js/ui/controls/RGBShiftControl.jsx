'use strict';

const React = require('react');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const autoBind = require('../../util/autoBind.js');

class RGBShiftControl extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

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
        console.log('rgb', this.state);
        return (
            <div className="control">
                <div className="header">RGB SHIFT</div>
                <div className="row">
                    <span className="label">Amount</span>
                    <NumberInput
                        name="amount"
                        size="3"
                        value={this.state.amount}
                        min={0}
                        max={1.0}
                        step={0.001}
                        onChange={this.onChange}
                        />
                    <div className="input flex">
                        <RangeInput
                            name="amount"
                            min={0.0}
                            max={1.0}
                            step={0.001}
                            value={this.state.amount}
                            onChange={this.onChange}
                            />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Angle</span>
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
                </div>
            </div>
        );
    }
}

module.exports = RGBShiftControl;
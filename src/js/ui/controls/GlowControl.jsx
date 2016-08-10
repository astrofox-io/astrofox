'use strict';

const React = require('react');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const autoBind = require('../../util/autoBind.js');

const GLOW_MAX = 50;

class GlowControl extends React.Component {
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
        return (
            <div className="control">
                <div className="header">GLOW</div>
                <div className="row">
                    <span className="label">Amount</span>
                    <NumberInput
                        name="amount"
                        size="3"
                        value={this.state.amount}
                        min={0}
                        step={0.01}
                        max={1}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="amount"
                            min={0}
                            step={0.01}
                            max={1}
                            value={this.state.amount}
                            onChange={this.onChange} />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Intensity</span>
                    <NumberInput
                        name="intensity"
                        size="3"
                        value={this.state.intensity}
                        min={1}
                        step={0.01}
                        max={3}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="intensity"
                            min={1}
                            step={0.01}
                            max={3}
                            value={this.state.intensity}
                            onChange={this.onChange} />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = GlowControl;
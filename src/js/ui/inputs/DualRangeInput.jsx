'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const { clamp, interval, val2pct } = require('../../util/math');

const RangeInput = require('./RangeInput.jsx');

class DualRangeInput extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        };

        this.buffering = false
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== undefined) {
            this.setState({ value: nextProps.value });
        }
    }

    onChange(name, val) {
        let values = this.state.value,
            index = parseInt(name.substr(-1)),
            midpoint = values[0] + ((values[1]-values[0])/2);

        if (index === 1 && val < midpoint) {
            values[0] = val;
        }
        else {
            values[index] = val;
        }

        this.props.onChange(this.props.name, values);
    }

    onInput(name, val) {
        let values = this.state.value,
            index = parseInt(name.substr(-1));

        values[index] = val;

        this.props.onInput(this.props.name, values);
    }

    isBuffering() {
        return this.buffering;
    }

    render() {
        let val = this.state.value,
            { name, min, max, step, buffered, readOnly } = this.props,
            pct0 = val2pct(val[0], min, max) * 100,
            pct1 = val2pct(val[1], min, max) * 100,
            fillStyle = { width: pct1 - pct0 + '%', marginLeft: pct0 + '%' };

        return (
            <div className="input-dual-range">
                <RangeInput
                    name={name+'0'}
                    min={min}
                    max={max}
                    step={step}
                    value={val[0]}
                    lowerLimit={min}
                    upperLimit={val[1]}
                    buffered={buffered}
                    readOnly={readOnly}
                    fillStyle="none"
                    onChange={this.onChange}
                    onInput={this.onInput}
                />
                <RangeInput
                    name={name+'1'}
                    min={min}
                    max={max}
                    step={step}
                    value={val[1]}
                    lowerLimit={min}
                    upperLimit={max}
                    buffered={buffered}
                    readOnly={readOnly}
                    fillStyle="none"
                    onChange={this.onChange}
                    onInput={this.onInput}
                />
                <div className="fill" style={fillStyle} />
            </div>
        );
    }
}

DualRangeInput.defaultProps = {
    name: "dualrange",
    min: 0,
    max: 1,
    value: [0,1],
    step: 1,
    buffered: false,
    readOnly: false,
    onChange: () => {},
    onInput: () => {}
};

module.exports = DualRangeInput;
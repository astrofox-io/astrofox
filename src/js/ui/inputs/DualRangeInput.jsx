'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const { val2pct } = require('../../util/math');

const RangeInput = require('./RangeInput.jsx');

class DualRangeInput extends UIComponent {
    constructor(props) {
        super(props);

        this.buffering = false
    }

    componentWillReceiveProps(nextProps) {
        let { name, start, end, minRange } = this.props;

        if (nextProps.start !== start || nextProps.end !== end) {
            // Check if new values are within range
            if (minRange !== false) {
                let check = this.checkRange(
                    nextProps.start,
                    nextProps.end,
                    (nextProps.start !== start) ? 0 : 1
                );

                if (check.start !== nextProps.start || check.end !== nextProps.end) {
                    this.props.onChange(name, check);
                }
            }
        }
    }

    onChange(name, val) {
        let { start, end } = this.props,
            index = parseInt(name.substr(-1)),
            size = end - start,
            midpoint = start + (size/2);

        // Move specific thumb
        if (index == 1) {
            if (val < midpoint) {
                start = val;
                index = 0;
            }
            else {
                end = val;
                index = 1;
            }
        }
        else {
            start = val;
            index = 0;
        }

        this.props.onChange(this.props.name, this.checkRange(start, end, index));
    }

    onInput(name, val) {
        // TODO
    }

    checkRange(start, end, index) {
        let { minRange } = this.props,
            range = end - start;

        // Enforce min range
        if (minRange !== false && range < minRange) {
            if (index == 1) {
                end = start + minRange;
            }
            else {
                start = end - minRange;
            }
        }

        return { start, end };
    }

    isBuffering() {
        return this.buffering;
    }

    render() {
        let { name, min, max, step, start, end, buffered, readOnly } = this.props,
            pct0 = val2pct(start, min, max) * 100,
            pct1 = val2pct(end, min, max) * 100,
            fillStyle = { width: pct1 - pct0 + '%', marginLeft: pct0 + '%' };

        return (
            <div className="input-dual-range">
                <RangeInput
                    name={name+'0'}
                    min={min}
                    max={max}
                    step={step}
                    value={start}
                    lowerLimit={min}
                    upperLimit={end}
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
                    value={end}
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
    step: 1,
    start: 0,
    end: 0,
    minRange: false,
    buffered: false,
    readOnly: false,
    onChange: () => {},
    onInput: () => {}
};

module.exports = DualRangeInput;
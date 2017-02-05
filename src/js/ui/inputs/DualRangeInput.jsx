import React from 'react';

import UIComponent from '../UIComponent';
import { val2pct } from '../../util/math';

import RangeInput from './RangeInput';

export default class DualRangeInput extends UIComponent {
    constructor(props) {
        super(props);

        this.buffering = false;
    }

    componentWillReceiveProps(nextProps) {
        let { name, start, end, minRange } = this.props;

        if (nextProps.start !== start || nextProps.end !== end) {
            // Check if new values are within range
            if (minRange !== false) {
                let check = this.parseValues(
                    nextProps.start,
                    nextProps.end,
                    (nextProps.start !== start) ? 0 : 1
                );

                if (check.start !== nextProps.start || check.end !== nextProps.end) {
                    if (this.props.onChange) {
                        this.props.onChange(name, check);
                    }
                }
            }
        }
    }

    onClick(e) {
        e.stopPropagation();

        let { start, end, max, min } = this.props,
            size = end - start,
            midpoint = start + (size/2),
            index = 0,
            rect = e.currentTarget.getBoundingClientRect(),
            val = ((e.clientX - rect.left) / rect.width) * (max - min);

        if (val < midpoint) {
            start = val;
            index = 0;
        }
        else {
            end = val;
            index = 1;
        }

        if (this.props.onChange) {
            this.props.onChange(this.props.name, this.parseValues(start, end, index));
        }
    }

    onChange(name, val) {
        let { start, end } = this.props,
            index = name === 'range0' ? 0 : 1;

        if (index == 0) {
            start = val;
        }
        else {
            end = val;
        }

        if (this.props.onChange) {
            this.props.onChange(this.props.name, this.parseValues(start, end, index));
        }
    }

    parseValues(start, end, index) {
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
        let { min, max, step, start, end, buffered, readOnly } = this.props,
            pct0 = val2pct(start, min, max) * 100,
            pct1 = val2pct(end, min, max) * 100,
            fillStyle = { width: pct1 - pct0 + '%', marginLeft: pct0 + '%' };

        return (
            <div
                ref='range'
                className='input-dual-range'
                onClick={this.onClick}>
                <RangeInput
                    ref='range0'
                    name='range0'
                    min={min}
                    max={max}
                    step={step}
                    value={start}
                    lowerLimit={min}
                    upperLimit={end}
                    buffered={buffered}
                    readOnly={readOnly}
                    fillStyle='none'
                    onChange={this.onChange}
                    onInput={this.onInput}
                />
                <RangeInput
                    ref='range1'
                    name='range1'
                    min={min}
                    max={max}
                    step={step}
                    value={end}
                    lowerLimit={min}
                    upperLimit={max}
                    buffered={buffered}
                    readOnly={readOnly}
                    fillStyle='none'
                    onChange={this.onChange}
                    onInput={this.onInput}
                />
                <div className='fill' style={fillStyle} />
            </div>
        );
    }
}

DualRangeInput.defaultProps = {
    name: 'dualrange',
    min: 0,
    max: 1,
    step: 1,
    start: 0,
    end: 0,
    minRange: false,
    buffered: false,
    readOnly: false,
    onChange: null,
    onInput: null
};
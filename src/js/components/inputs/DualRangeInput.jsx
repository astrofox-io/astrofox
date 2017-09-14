import React from 'react';

import UIComponent from 'components/UIComponent';
import { val2pct } from 'util/math';

import RangeInput from 'lib/inputs';

export default class DualRangeInput extends UIComponent {
    constructor(props) {
        super(props);

        this.buffering = false;
    }

    onTrackClick(e) {
        e.stopPropagation();

        if (!this.props.allowClick) return;

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

    onChange(key, val) {
        let { name, start, end, onChange } = this.props,
            index = key === 'range-start' ? 0 : 1;

        if (index === 0) {
            start = val;
        }
        else {
            end = val;
        }

        if (onChange) {
            onChange(name, {start, end});
        }
    }

    parseValues(start, end, index) {
        let { minRange } = this.props,
            range = end - start;

        // Enforce min range
        if (minRange !== false && range < minRange) {
            if (index === 1) {
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
        let { min, max, step, start, end, buffered, readOnly, minRange } = this.props,
            pct0 = val2pct(start, min, max) * 100,
            pct1 = val2pct(end, min, max) * 100,
            fillStyle = { width: pct1 - pct0 + '%', marginLeft: pct0 + '%' };

        return (
            <div
                ref={e => this.range = e}
                className='input-dual-range'
                onMouseDown={this.onTrackClick}>
                <div className="track" />
                <div className='fill' style={fillStyle} />
                <RangeInput
                    ref={e => this.range0 = e}
                    name='range-start'
                    min={min}
                    max={max}
                    step={step}
                    value={start}
                    lowerLimit={min}
                    upperLimit={minRange !== false ? end - minRange : end}
                    buffered={buffered}
                    readOnly={readOnly}
                    showTrack={false}
                    fillStyle='none'
                    onChange={this.onChange}
                    onInput={this.onInput}
                />
                <RangeInput
                    ref={e => this.range1 = e}
                    name='range-end'
                    min={min}
                    max={max}
                    step={step}
                    value={end}
                    lowerLimit={minRange !== false ? start + minRange : start}
                    upperLimit={max}
                    buffered={buffered}
                    readOnly={readOnly}
                    showTrack={false}
                    fillStyle='none'
                    onChange={this.onChange}
                    onInput={this.onInput}
                />
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
    allowClick: true,
    onChange: null,
    onInput: null
};
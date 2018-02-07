import React, { Component } from 'react';
import RangeInput from 'components/inputs/RangeInput';
import { val2pct } from 'utils/math';
import styles from './DualRangeInput.less';

export default class DualRangeInput extends Component {
    static defaultProps = {
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
        onChange: () => {},
        onInput: () => {}
    }

    constructor(props) {
        super(props);

        this.buffering = false;
    }

    onTrackClick = (e) => {
        e.stopPropagation();

        const { name, start, end, max, min, allowClick, onChange } = this.props;

        if (!allowClick) return;

        let newStart = start,
            newEnd = end,
            size = end - start,
            midpoint = start + (size/2),
            index = 0,
            rect = e.currentTarget.getBoundingClientRect(),
            val = ((e.clientX - rect.left) / rect.width) * (max - min);

        if (val < midpoint) {
            newStart = val;
            index = 0;
        }
        else {
            newEnd = val;
            index = 1;
        }

        onChange(name, this.parseValues(newStart, newEnd, index));
    }

    onChange = (key, val) => {
        const { name, start, end, onChange } = this.props;
        let newStart = start,
            newEnd = end,
            index = key === 'range-start' ? 0 : 1;

        if (index === 0) {
            newStart = val;
        }
        else {
            newEnd = val;
        }

        onChange(name, { start: newStart, end: newEnd });
    }

    parseValues(start, end, index) {
        const { minRange } = this.props;
        let range = end - start;

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
                className={styles.input}
                onMouseDown={this.onTrackClick}>
                <div className={styles.track} />
                <div className={styles.fill} style={fillStyle} />
                <RangeInput
                    ref={e => this.range0 = e}
                    className={styles.range}
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
                    className={styles.range}
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

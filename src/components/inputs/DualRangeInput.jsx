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
    }

    constructor(props) {
        super(props);

        this.buffering = false;
    }

    handleTrackClick = (e) => {
        e.stopPropagation();

        const {
            name,
            start,
            end,
            max,
            min,
            allowClick,
            onChange,
        } = this.props;

        if (!allowClick) return;

        const size = end - start;
        const midpoint = start + (size / 2);
        const rect = e.currentTarget.getBoundingClientRect();
        const val = ((e.clientX - rect.left) / rect.width) * (max - min);
        let newStart = start;
        let newEnd = end;
        let index = 0;

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

    handleChange = (key, val) => {
        const {
            name, start, end, onChange,
        } = this.props;
        const index = key === 'range-start' ? 0 : 1;
        let newStart = start;
        let newEnd = end;

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
        const range = end - start;
        let newStart = start;
        let newEnd = end;

        // Enforce min range
        if (minRange !== false && range < minRange) {
            if (index === 1) {
                newEnd = start + minRange;
            }
            else {
                newStart = end - minRange;
            }
        }

        return { newStart, newEnd };
    }

    isBuffering() {
        return this.buffering;
    }

    render() {
        const {
            min,
            max,
            step,
            start,
            end,
            buffered,
            readOnly,
            minRange,
        } = this.props;

        const pct0 = val2pct(start, min, max) * 100;
        const pct1 = val2pct(end, min, max) * 100;
        const fillStyle = { width: `${pct1 - pct0}%`, marginLeft: `${pct0}%` };

        return (
            <div
                role="presentation"
                ref={e => (this.range = e)}
                className={styles.input}
                onMouseDown={this.handleTrackClick}
            >
                <div className={styles.track} />
                <div className={styles.fill} style={fillStyle} />
                <RangeInput
                    ref={e => (this.range0 = e)}
                    className={styles.range}
                    name="range-start"
                    min={min}
                    max={max}
                    step={step}
                    value={start}
                    lowerLimit={min}
                    upperLimit={minRange !== false ? end - minRange : end}
                    buffered={buffered}
                    readOnly={readOnly}
                    showTrack={false}
                    fillStyle="none"
                    onChange={this.handleChange}
                />
                <RangeInput
                    ref={e => (this.range1 = e)}
                    className={styles.range}
                    name="range-end"
                    min={min}
                    max={max}
                    step={step}
                    value={end}
                    lowerLimit={minRange !== false ? start + minRange : start}
                    upperLimit={max}
                    buffered={buffered}
                    readOnly={readOnly}
                    showTrack={false}
                    fillStyle="none"
                    onChange={this.handleChange}
                />
            </div>
        );
    }
}

import React, { Component } from 'react';
import classNames from 'classnames';
import { val2pct } from 'utils/math';
import styles from './RangeInput.less';

export default class RangeInput extends Component {
    static defaultProps = {
        name: 'range',
        min: 0,
        max: 1,
        value: 0,
        step: 1,
        lowerLimit: false,
        upperLimit: false,
        buffered: false,
        readOnly: false,
        fillStyle: 'left',
        showTrack: true,
        onChange: null,
        onInput: null
    }

    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        };

        this.buffering = false;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== undefined) {
            this.setValue(nextProps.value, Object.assign({}, this.props, nextProps));
        }
    }

    onChange = (e) => {
        let props = this.props;

        let val = this.setValue(e.currentTarget.value, props);

        if (props.buffered && this.buffering && props.onInput) {
            props.onInput(props.name, val);
        }
        else if (props.onChange) {
            props.onChange(props.name, val);
        }
    }

    onMouseDown = () => {
        if (this.props.buffered) {
            this.buffering = true;
        }
    }

    onMouseUp = (e) => {
        if (this.props.buffered) {
            this.buffering = false;
            this.onChange(e);
        }
    }

    setValue(val, props) {
        val = this.parseValue(val, props);

        this.setState({ value: val });

        return val;
    }

    parseValue(val, props) {
        let { lowerLimit, upperLimit } = props;

        if (lowerLimit !== false && val < lowerLimit) {
            val = lowerLimit;
        }
        else if (upperLimit !== false && val > upperLimit) {
            val = upperLimit;
        }

        return Number(val);
    }

    isBuffering() {
        return this.buffering;
    }

    getFillStyle() {
        const { min, max, fillStyle } = this.props;
        const { value } = this.state;
        const pct = val2pct(value, min, max) * 100;

        switch (fillStyle) {
            case 'left':
                return { width: pct + '%' };
            case 'right':
                return { width: (100 - pct) + '%', marginLeft: pct + '%' };
            default:
                return { display: 'none' };
        }
    }

    render() {
        const { name, min, max, step, readOnly, showTrack } = this.props;
        const { value } = this.state;


        return (
            <div className={styles.range}>
                <div
                    className={classNames({
                        [styles.track]: true,
                        [styles.hidden]: !showTrack
                    })}
                    onMouseDown={e => console.log('track')}
                />
                <div
                    className={styles.fill}
                    style={this.getFillStyle()}
                    onMouseDown={e => console.log('fill')}
                />
                <input
                    type="range"
                    name={name}
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={this.onChange}
                    onMouseDown={this.onMouseDown}
                    onMouseUp={this.onMouseUp}
                    readOnly={readOnly}
                />
            </div>
        );
    }
}

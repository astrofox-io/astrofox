import React, { Component } from 'react';
import classNames from 'classnames';
import { clamp, roundTo } from 'utils/math.js';
import styles from './NumberInput.less';

export default class NumberInput extends Component {
    static defaultProps = {
        name: 'number',
        width: 40,
        value: 0,
        min: false,
        max: false,
        step: false,
        readOnly: false,
        hidden: false,
        onChange: () => {}
    }

    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== undefined) {
            this.setValue(nextProps.value, Object.assign({}, this.props, nextProps));
        }
    }

    onChange = (e) => {
        this.setState({ value: e.target.value });
    }

    onKeyUp = (e) => {
        e.stopPropagation();

        // Enter key
        if (e.keyCode === 13) {
            this.checkValue();
        }
    }

    onBlur = (e) => {
        e.stopPropagation();

        this.checkValue();
    }

    setValue(val, props) {
        val = this.parseValue(val, props);

        this.setState({ value: val });

        return val;
    }

    parseValue(val, props) {
        let { min, max, step } = props;

        // Clamp to min/max
        if (min !== false && max !== false) {
            val = clamp(val, min, max);
        }

        // Round value to nearest interval
        if (step !== false) {
            val = roundTo(val, step);
        }

        return Number(val);
    }

    checkValue() {
        let val = this.state.value,
            props = this.props;

        if (props.value !== val) {
            let regex = /^(0|-?([0-9]*\.[0-9]+|[1-9]+[0-9]*))$/;

            // If valid number
            if (regex.test(val)) {
                val = this.setValue(val, props);

                // Send new value to parent
                if (props.onChange) {
                    props.onChange(props.name, val);
                }
            }
            // Reset to old value
            else {
                this.setValue(props.value, props);
            }
        }
    }

    render() {
        const { name, width, className, readOnly } = this.props;
        const { value } = this.state;

        return (
            <div>
                <input
                    type="text"
                    className={classNames(styles.input, className)}
                    style={{width}}
                    name={name}
                    value={value}
                    onChange={this.onChange}
                    onBlur={this.onBlur}
                    onKeyUp={this.onKeyUp}
                    readOnly={readOnly}
                />
            </div>
        );
    }
}

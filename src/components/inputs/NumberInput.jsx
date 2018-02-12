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
        onChange: () => {},
    }

    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
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
        const value = this.parseValue(val, props);

        this.setState({ value });

        return value;
    }

    parseValue(val, props) {
        let value = val;
        const { min, max, step } = props;

        // Clamp to min/max
        if (min !== false && max !== false) {
            value = clamp(value, min, max);
        }

        // Round value to nearest interval
        if (step !== false) {
            value = roundTo(value, step);
        }

        return Number(value);
    }

    checkValue() {
        let { value: stateValue } = this.state;
        const { name, value, onChange } = this.props;

        if (value !== stateValue) {
            const regex = /^(0|-?([0-9]*\.[0-9]+|[1-9]+[0-9]*))$/;

            // If valid number
            if (regex.test(stateValue)) {
                stateValue = this.setValue(stateValue, this.props);

                // Send new value to parent
                onChange(name, stateValue);
            }
            // Reset to old value
            else {
                this.setValue(value, this.props);
            }
        }
    }

    render() {
        const {
            name,
            width,
            className,
            readOnly,
        } = this.props;

        const { value } = this.state;

        return (
            <div>
                <input
                    type="text"
                    className={classNames(styles.input, className)}
                    style={{ width }}
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

import React from 'react';
import classNames from 'classnames';

import UIComponent from 'components/UIComponent';
import { clamp, roundTo } from 'util/math.js';

export default class NumberInput extends UIComponent {
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

    onChange(e) {
        this.setState({ value: e.target.value });
    }

    onKeyUp(e) {
        e.stopPropagation();

        // Enter key
        if (e.keyCode === 13) {
            this.checkValue();
        }
    }

    onBlur(e) {
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

    render(){
        return (
            <div className="input">
                <input
                    type="text"
                    className={classNames('input-field', {'input-hidden': this.props.hidden})}
                    style={{width: this.props.width}}
                    name={this.props.name}
                    size={this.props.size}
                    value={this.state.value}
                    onChange={this.onChange}
                    onBlur={this.onBlur}
                    onKeyUp={this.onKeyUp}
                    readOnly={this.props.readOnly}
                />
            </div>
        );
    }
}

NumberInput.defaultProps = {
    name: 'number',
    size: null,
    width: 40,
    value: 0,
    min: false,
    max: false,
    step: false,
    readOnly: false,
    hidden: false,
    onChange: null
};
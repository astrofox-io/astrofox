'use strict';

const React = require('react');
const classNames = require('classnames');
const autoBind = require('../../util/autoBind.js');

class NumberInput extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            value: props.value
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.state.value) {
            this.setValue(nextProps.value, nextProps.min, nextProps.max);
        }
    }

    handleChange(e) {
        this.setState({ value: e.target.value });
    }

    handleValueChange(e) {
        e.stopPropagation();
        e.preventDefault();

        let val = this.state.value,
            min = this.props.min,
            max = this.props.max,
            step = this.props.step;

        if (this.props.value !== val) {
            let regex = /^(0|\-?([0-9]*\.[0-9]+|[1-9]+[0-9]*))$/;

            // If valid number
            if (regex.test(val)) {
                if (step !== null && step > 0) {
                    val = (Math.round(val / step) * step).toPrecision(2);
                }

                if (min !== null && val < min) {
                    val = min;
                }
                else if (max !== null && val > max) {
                    val = max;
                }

                this.setState({ value: val }, function() {
                    this.props.onChange(this.props.name, Number(val));
                }.bind(this));
            }
            // Reset to old value
            else {
                this.setValue(this.props.value, min, max);
            }
        }
    }

    handleKeyUp(e) {
        e.stopPropagation();
        e.preventDefault();

        if (e.keyCode === 13) {
            this.handleValueChange(e);
        }
    }

    setValue(val, min, max, callback) {
        if (max != null && val > max) {
            val = max;
        }
        else if (min != null && val < min) {
            val = min;
        }

        this.setState({ value: val }, callback);
    }

    render(){
        return (
            <div className="input">
                <input type="text"
                    className={classNames({ 'input-field': true, 'input-hidden': this.props.hidden })}
                    name={this.props.name}
                    size={this.props.size}
                    value={this.state.value}
                    onChange={this.handleChange}
                    onBlur={this.handleValueChange}
                    onKeyUp={this.handleKeyUp}
                    readOnly={this.props.readOnly}
                />
            </div>
        );
    }
}

NumberInput.defaultProps = {
    name: "number",
    size: 3,
    value: 0,
    min: null,
    max: null,
    step: null,
    readOnly: false,
    hidden: false
};

module.exports = NumberInput;
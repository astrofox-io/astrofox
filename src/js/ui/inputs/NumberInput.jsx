'use strict';

var React = require('react');

var NumberInput = React.createClass({
    getDefaultProps: function() {
        return {
            name: "number",
            size: 3,
            value: 0,
            min: null,
            max: null,
            step: null,
            readOnly: false,
            hidden: false
        };
    },

    getInitialState: function() {
        return {
            value: this.props.value
        };
    },

    componentWillReceiveProps: function(props) {
        if (typeof props.value !== 'undefined') {
            this.setValue(props.value);
        }
    },

    handleChange: function(e) {
        this.setState({ value: e.target.value });
    },

    handleValueChange: function(e) {
        e.stopPropagation();
        e.preventDefault();

        var val = this.state.value,
            min = this.props.min,
            max = this.props.max,
            step = this.props.step;

        if (this.props.value !== val) {
            var regex =/^(0|\-?([0-9]*\.[0-9]+|[1-9]+[0-9]*))$/;

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

                this.props.onChange(this.props.name, Number(val));
            }
            else {
                this.setValue(this.props.value);
            }
        }
    },

    handleKeyUp: function(e) {
        e.stopPropagation();
        e.preventDefault();

        if (e.keyCode === 13) {
            this.handleValueChange(e);
        }
    },

    setValue: function(val, callback) {
        var min = this.props.min,
            max = this.props.max;

        if (val > max) {
            val = max;
        }
        else if (val < min) {
            val = min;
        }

        this.setState({ value: val }, callback);
    },

    render: function(){
        var classes = 'input-field';
        if (this.props.hidden) {
            classes += ' input-hidden';
        }

        return (
            <div className="input">
                <input type="text"
                    className={classes}
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
});

module.exports = NumberInput;
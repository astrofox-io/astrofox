'use strict';

const React = require('react');
const autoBind = require('../../util/autoBind.js');

class RangeInput extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            value: props.value
        };
    }

    componentDidMount() {
        this.active = false;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.state.value && !this.active) {
            this.setValue(nextProps.value, nextProps.min, nextProps.max);
        }
    }

    handleChange(e) {
        let val = e.currentTarget.value;

        this.setValue(
            val,
            this.props.min,
            this.props.max,
            function() {
                if (!this.props.buffered && this.props.onChange) {
                    this.props.onChange(this.props.name, Number(val));
                }

                if (this.props.onUpdate) {
                    this.props.onUpdate(this.props.name, Number(val));
                }
            }.bind(this)
        );
    }

    handleMouseDown(e) {
        if (this.props.buffered) {
            this.active = true;
        }
    }

    handleMouseUp(e) {
        if (this.props.buffered) {
            let val = e.currentTarget.value;
            this.props.onChange(this.props.name, Number(val));
            this.active = false;
        }
    }

    isActive() {
        return this.active;
    }

    getPosition() {
        let min = this.props.min,
            max = this.props.max,
            val = this.state.value;

        if (max > min) {
            return ((val - min) / (max - min) * 100);
        }

        return 0;
    }

    setValue(val, min, max, callback) {
        if (val > max) {
            val = max;
        }
        else if (val < min) {
            val = min;
        }

        this.setState({ value: val }, callback);
    }

    render() {
        let props = this.props,
            fillStyle = { width: + this.getPosition() + '%' };

        return (
            <div className="input-range">
                <div className="track" />
                <div className="fill" style={fillStyle} />
                <input
                    className="range"
                    type="range"
                    name={props.name}
                    min={props.min}
                    max={props.max}
                    step={props.step}
                    value={this.state.value}
                    onChange={this.handleChange}
                    onMouseDown={this.handleMouseDown}
                    onMouseUp={this.handleMouseUp}
                    readOnly={props.readOnly}
                />
            </div>
        );
    }
}

RangeInput.defaultProps = {
    name: "range",
    min: 0,
    max: 100,
    step: 1,
    buffered: false,
    readOnly: false
};

module.exports = RangeInput;
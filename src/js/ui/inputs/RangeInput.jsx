'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const { clamp, val2pct, hash } = require('../../util/math');

class RangeInput extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        };

        this.buffering = false
    }

    componentWillReceiveProps(props) {
        if (props.value !== undefined) {
            this.setValue(props.value, Object.assign({}, this.props, props));
        }
    }

    onChange(e) {
        let props = this.props;

        let val = this.setValue(Number(e.currentTarget.value), props);

        if (props.buffered && this.buffering) {
            props.onInput(props.name, val);
        }
        else {
            props.onChange(props.name, val);
        }
    }

    onMouseDown(e) {
        if (this.props.buffered) {
            this.buffering = true;
        }
    }

    onMouseUp(e) {
        if (this.props.buffered) {
            this.buffering = false;
            this.onChange(e);
        }
    }


    setValue(val, props) {
        if (props.lowerLimit !== false && val < props.lowerLimit) {
            val = props.lowerLimit;
        }
        else if (props.upperLimit !== false && val > props.upperLimit) {
            val = props.upperLimit;
        }

        this.setState({ value: val });

        return val;
    }

    isBuffering() {
        return this.buffering;
    }

    render() {
        let props = this.props,
            fillStyle = { width: (val2pct(this.state.value, props.min, props.max) * 100) + '%' };

        return (
            <div className="input-range">
                <div className="track"/>
                <div className="fill" style={fillStyle}/>
                <input
                    className="range"
                    type="range"
                    name={props.name}
                    min={props.min}
                    max={props.max}
                    step={props.step}
                    value={clamp(this.state.value, props.min, props.max)}
                    onChange={this.onChange}
                    onMouseDown={this.onMouseDown}
                    onMouseUp={this.onMouseUp}
                    readOnly={props.readOnly}
                />
            </div>
        );
    }
}

RangeInput.defaultProps = {
    name: "range",
    min: 0,
    max: 1,
    value: 0,
    step: 1,
    lowerLimit: false,
    upperLimit: false,
    buffered: false,
    readOnly: false,
    onChange: () => {},
    onInput: () => {}
};

module.exports = RangeInput;
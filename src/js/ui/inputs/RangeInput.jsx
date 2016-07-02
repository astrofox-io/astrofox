'use strict';

const React = require('react');
const autoBind = require('../../util/autoBind.js');

class RangeInput extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.buffering = false;
    }

    handleChange(e) {
        if (this.props.buffered && this.buffering) {
            this.props.onInput(this.props.name, e.currentTarget.value);
        }
        else {
            this.props.onChange(this.props.name, e.currentTarget.value);
        }
    }

    handleMouseDown(e) {
        if (this.props.buffered) {
            this.buffering = true;
        }
    }

    handleMouseUp(e) {
        if (this.props.buffered) {
            this.buffering = false;
            this.props.onChange(this.props.name, e.currentTarget.value);
        }
    }

    isBuffering() {
        return this.buffering;
    }

    render() {
        let props = this.props,
            fillStyle = { width: ~~(props.value / props.max * 100) + '%' };

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
                    value={props.value}
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
    max: 1,
    value: 0,
    step: 1,
    buffered: false,
    readOnly: false,
    onChange: () => {},
    onInput: () => {}
};

function clamp(num, min, max) {
    return num < min ? min : num > max ? max : num;
}

module.exports = RangeInput;
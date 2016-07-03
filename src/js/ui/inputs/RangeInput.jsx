'use strict';

const React = require('react');
const autoBind = require('../../util/autoBind.js');

class RangeInput extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.buffering = false;
    }

    onChange(e) {
        if (this.props.buffered && this.buffering) {
            this.props.onInput(this.props.name, e.currentTarget.value);
        }
        else {
            this.props.onChange(this.props.name, e.currentTarget.value);
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
            this.props.onChange(this.props.name, e.currentTarget.value);
        }
    }

    isBuffering() {
        return this.buffering;
    }

    render() {
        let props = this.props,
            fillStyle = { width: (val2pct(props.value, props.min, props.max) * 100) + '%' };

        return (
            <div className="input-range">
                <div className="track"/>
                <div className="fill" style={fillStyle}/>
                <input
                    key={props.name + '_' + props.min + '_' + props.max}
                    className="range"
                    type="range"
                    name={props.name}
                    min={props.min}
                    max={props.max}
                    step={props.step}
                    value={clamp(props.value, props.min, props.max)}
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
    buffered: false,
    readOnly: false,
    onChange: () => {},
    onInput: () => {}
};

function val2pct(val, min, max) {
    if (min === max) return max;
    if (val > max) val = max;
    else if (val < min) val = min;
    return (val - min) / (max - min);
}

function clamp(num, min, max) {
    return num < min ? min : num > max ? max : num;
}

module.exports = RangeInput;
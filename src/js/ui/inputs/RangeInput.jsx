'use strict';

const React = require('react');

const autoBind = require('../../util/autoBind.js');
const { clamp, val2pct, hash } = require('../../util/math.js');

class RangeInput extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.buffering = false;
    }

    onChange(e) {
        let val = Number(e.currentTarget.value);

        if (this.props.buffered && this.buffering) {
            this.props.onInput(this.props.name, val);
        }
        else {
            this.props.onChange(this.props.name, val);
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
            this.props.onChange(this.props.name, Number(e.currentTarget.value));
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
                    key={hash(props.name + props.min + props.max + props.step)}
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

module.exports = RangeInput;
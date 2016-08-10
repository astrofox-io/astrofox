'use strict';

const React = require('react');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const autoBind = require('../../util/autoBind.js');

const OFFSET_MAX = 854;

class RGBShiftControl extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = this.props.display.options;
        this.shouldUpdate = false;
    }

    componentDidUpdate() {
        this.shouldUpdate = false;
    }

    shouldComponentUpdate() {
        return this.shouldUpdate;
    }

    onChange(name, val) {
        let obj = {},
            display = this.props.display;

        obj[name] = val;

        this.shouldUpdate = true;

        this.setState(obj, () => {
            display.update(obj);
        });
    }

    render() {
        return (
            <div className="control">
                <div className="header">RGB SHIFT</div>
                <div className="row">
                    <span className="label">Offset</span>
                    <NumberInput
                        name="offset"
                        size="3"
                        value={this.state.offset}
                        min={0}
                        max={OFFSET_MAX}
                        step={1}
                        onChange={this.onChange}
                        />
                    <div className="input flex">
                        <RangeInput
                            name="offset"
                            min={0.0}
                            max={OFFSET_MAX}
                            step={1}
                            value={this.state.offset}
                            onChange={this.onChange}
                            />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Angle</span>
                    <NumberInput
                        name="angle"
                        size="3"
                        value={this.state.angle}
                        min={0}
                        max={360}
                        onChange={this.onChange}
                        />
                    <div className="input flex">
                        <RangeInput
                            name="angle"
                            min={0}
                            max={360}
                            value={this.state.angle}
                            onChange={this.onChange}
                            />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = RGBShiftControl;
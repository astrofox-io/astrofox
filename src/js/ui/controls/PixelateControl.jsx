'use strict';

const React = require('react');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const SelectInput = require('../inputs/SelectInput.jsx');
const autoBind = require('../../util/autoBind.js');

const types = [
    'Square',
    'Hexagon'
];

const MIN_PIXEL_SIZE = 2;
const MAX_PIXEL_SIZE = 240;

class PixelateControl extends React.Component {
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
                <div className="header">PIXELATE</div>
                <div className="row">
                    <span className="label">Type</span>
                    <SelectInput
                        name="type"
                        size="20"
                        items={types}
                        value={this.state.type}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <span className="label">Size</span>
                    <NumberInput
                        name="size"
                        size="3"
                        value={this.state.size}
                        min={MIN_PIXEL_SIZE}
                        max={MAX_PIXEL_SIZE}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="size"
                            min={MIN_PIXEL_SIZE}
                            max={MAX_PIXEL_SIZE}
                            value={this.state.size}
                            onChange={this.onChange} />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = PixelateControl;
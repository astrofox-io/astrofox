'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const SelectInput = require('../inputs/SelectInput.jsx');
const { Control, Row } = require('./Control.jsx');

const types = [
    'Square',
    'Hexagon'
];

const MIN_PIXEL_SIZE = 2;
const MAX_PIXEL_SIZE = 240;

class PixelateControl extends UIComponent {
    constructor(props) {
        super(props);

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
            <Control title="PIXELATE">
                <Row label="Type">
                    <SelectInput
                        name="type"
                        size="20"
                        items={types}
                        value={this.state.type}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Size">
                    <NumberInput
                        name="size"
                        size="3"
                        value={this.state.size}
                        min={MIN_PIXEL_SIZE}
                        max={MAX_PIXEL_SIZE}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="size"
                            min={MIN_PIXEL_SIZE}
                            max={MAX_PIXEL_SIZE}
                            value={this.state.size}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}

module.exports = PixelateControl;
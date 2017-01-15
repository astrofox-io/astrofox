'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const ColorInput = require('../inputs/ColorInput.jsx');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const SelectInput = require('../inputs/SelectInput.jsx');
const TextInput = require('../inputs/TextInput.jsx');
const ToggleInput = require('../inputs/ToggleInput.jsx');
const { Control, Row } = require('./Control.jsx');

const fontOptions = require('../../../config/fonts.json');

class TextControl extends UIComponent {
    constructor(props) {
        super(props);

        this.state = this.props.display.options;
        this.shouldUpdate = false;
    }

    componentDidMount() {
        let display = this.props.display;

        if (display.initialized) {
            this.shouldUpdate = true;

            this.setState(display.options);
        }
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

    getSelectItems() {
        return fontOptions.map(item => {
            return { name: item.name, value: item.name, style: { fontFamily: item.name } };
        });
    }

    render() {
        let maxHeight = 480;
        let maxWidth = 854;

        return (
            <Control label="TEXT" className={this.props.className}>
                <Row label="Text">
                    <TextInput
                        name="text"
                        width={140}
                        value={this.state.text}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Font">
                    <SelectInput
                        name="font"
                        width={140}
                        items={this.getSelectItems()}
                        value={this.state.font}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Size">
                    <NumberInput
                        name="size"
                        width={40}
                        min={0}
                        value={this.state.size}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Bold">
                    <ToggleInput
                        name="bold"
                        value={this.state.bold}
                        onChange={this.onChange}
                    />
                    <span className="label">Italic</span>
                    <ToggleInput
                        name="italic"
                        value={this.state.italic}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Color">
                    <ColorInput
                        name="color"
                        value={this.state.color}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="X">
                    <NumberInput
                        name="x"
                        width={40}
                        min={-maxWidth}
                        max={maxWidth}
                        value={this.state.x}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-maxWidth}
                            max={maxWidth}
                            value={this.state.x}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Y">
                    <NumberInput
                        name="y"
                        width={40}
                        min={-maxHeight}
                        max={maxHeight}
                        value={this.state.y}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-maxHeight}
                            max={maxHeight}
                            value={this.state.y}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Rotation">
                    <NumberInput
                        name="rotation"
                        width={40}
                        min={0}
                        max={360}
                        value={this.state.rotation}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="rotation"
                            min={0}
                            max={360}
                            value={this.state.rotation}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Opacity">
                    <NumberInput
                        name="opacity"
                        width={40}
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={this.state.opacity}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={this.state.opacity}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}

module.exports = TextControl;
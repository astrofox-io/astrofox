'use strict';

const React = require('react');

const UIComponent = require('../UIComponent.js');
const ColorInput = require('../inputs/ColorInput.jsx');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const SelectInput = require('../inputs/SelectInput.jsx');
const TextInput = require('../inputs/TextInput.jsx');
const ToggleInput = require('../inputs/ToggleInput.jsx');
const fontOptions = require('../../../conf/fonts.json');

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
            return { name: item, value: item, style: { fontFamily: item } };
        });
    }

    render() {
        let maxHeight = 480;
        let maxWidth = 854;

        return (
            <div className="control">
                <div className="header">TEXT</div>
                <div className="row">
                    <span className="label">Text</span>
                    <TextInput
                        name="text"
                        size="20"
                        value={this.state.text}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <span className="label">Font</span>
                    <SelectInput
                        name="font"
                        size="20"
                        items={this.getSelectItems()}
                        value={this.state.font}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <span className="label">Size</span>
                    <NumberInput
                        name="size"
                        size="3"
                        min={0}
                        value={this.state.size}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <span className="label">Bold</span>
                    <ToggleInput
                        name="bold"
                        value={this.state.bold}
                        onChange={this.onChange} />
                    <span className="label">Italic</span>
                    <ToggleInput
                        name="italic"
                        value={this.state.italic}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <span className="label">Color</span>
                    <ColorInput
                        name="color"
                        value={this.state.color}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <span className="label">X</span>
                    <NumberInput
                        name="x"
                        size="3"
                        min={-maxWidth}
                        max={maxWidth}
                        value={this.state.x}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-maxWidth}
                            max={maxWidth}
                            value={this.state.x}
                            onChange={this.onChange} />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Y</span>
                    <NumberInput
                        name="y"
                        size="3"
                        min={-maxHeight}
                        max={maxHeight}
                        value={this.state.y}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-maxHeight}
                            max={maxHeight}
                            value={this.state.y}
                            onChange={this.onChange} />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Rotation</span>
                    <NumberInput
                        name="rotation"
                        size="3"
                        min={0}
                        max={360}
                        value={this.state.rotation}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="rotation"
                            min={0}
                            max={360}
                            value={this.state.rotation}
                            onChange={this.onChange} />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Opacity</span>
                    <NumberInput
                        name="opacity"
                        size="3"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={this.state.opacity}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={this.state.opacity}
                            onChange={this.onChange} />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = TextControl;
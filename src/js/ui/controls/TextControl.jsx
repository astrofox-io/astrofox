'use strict';

const React = require('react');
const ColorInput = require('../inputs/ColorInput.jsx');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const SelectInput = require('../inputs/SelectInput.jsx');
const TextInput = require('../inputs/TextInput.jsx');
const ToggleInput = require('../inputs/ToggleInput.jsx');
const fontOptions = require('../../../conf/fonts.json');
const autoBind = require('../../util/autoBind.js');

const defaults = {
    text: '',
    size: 40,
    font: 'Roboto',
    italic: false,
    bold: false,
    x: 0,
    y: 0,
    color: '#FFFFFF',
    rotation: 0,
    opacity: 1.0
};

class TextControl extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = defaults;
    }

    componentWillMount() {
        this.shouldUpdate = false;
    }

    componentDidMount() {
        let display = this.props.display;

        if (display.initialized) {
            display.render();

            this.shouldUpdate = true;
            this.setState(display.options);
        }
        else {
            display.update(this.state);
        }
    }

    componentDidUpdate() {
        this.shouldUpdate = false;
    }

    shouldComponentUpdate() {
        return this.shouldUpdate;
    }

    handleChange(name, val) {
        let obj = {},
            display = this.props.display;

        obj[name] = val;

        this.shouldUpdate = true;

        this.setState(obj, function() {
            display.update(obj);
            display.render();
        });
    }

    getSelectItems() {
        return fontOptions.map(function(item) {
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
                    <label className="label">Text</label>
                    <TextInput
                        name="text"
                        size="20"
                        value={this.state.text}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Font</label>
                    <SelectInput
                        name="font"
                        size="20"
                        items={this.getSelectItems()}
                        value={this.state.font}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Size</label>
                    <NumberInput
                        name="size"
                        size="3"
                        min={0}
                        value={this.state.size}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Bold</label>
                    <ToggleInput
                        name="bold"
                        value={this.state.bold}
                        onChange={this.handleChange} />
                    <label className="label">Italic</label>
                    <ToggleInput
                        name="italic"
                        value={this.state.italic}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">Color</label>
                    <ColorInput
                        name="color"
                        value={this.state.color}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label className="label">X</label>
                    <NumberInput
                        name="x"
                        size="3"
                        min={-maxWidth}
                        max={maxWidth}
                        value={this.state.x}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-maxWidth}
                            max={maxWidth}
                            value={this.state.x}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Y</label>
                    <NumberInput
                        name="y"
                        size="3"
                        min={-maxHeight}
                        max={maxHeight}
                        value={this.state.y}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-maxHeight}
                            max={maxHeight}
                            value={this.state.y}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Rotation</label>
                    <NumberInput
                        name="rotation"
                        size="3"
                        min={0}
                        max={360}
                        value={this.state.rotation}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="rotation"
                            min={0}
                            max={360}
                            value={this.state.rotation}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Opacity</label>
                    <NumberInput
                        name="opacity"
                        size="3"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={this.state.opacity}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={this.state.opacity}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = TextControl;
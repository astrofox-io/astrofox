'use strict';

let React = require('react');

const ColorInput = require('../inputs/ColorInput.jsx');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const SelectInput = require('../inputs/SelectInput.jsx');
const TextInput = require('../inputs/TextInput.jsx');
const ToggleInput = require('../inputs/ToggleInput.jsx');
const autoBind = require('../../util/autoBind.js');
const config = require('../../props/Geometry.json');

class GeometryControl extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = config.options;
    }

    componentWillMount() {
        this.shouldUpdate = false;
    }

    componentDidMount() {
        let display = this.props.display;

        if (display.initialized) {
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
        let state = this.state;
        let maxVal = 500;

        return (
            <div className="control">
                <div className="header">3D GEOMETRY</div>
                <div className="row">
                    <label className="label">Shape</label>
                    <SelectInput
                        name="shape"
                        size="20"
                        items={config.shapes}
                        value={state.shape}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <label className="label">Material</label>
                    <SelectInput
                        name="material"
                        size="20"
                        items={config.materials}
                        value={state.material}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <label className="label">Shading</label>
                    <SelectInput
                        name="shading"
                        size="20"
                        items={config.shading}
                        value={state.shading}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <label className="label">Color</label>
                    <ColorInput
                        name="color"
                        value={state.color}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <label className="label">Wireframe</label>
                    <ToggleInput
                        name="wireframe"
                        value={state.wireframe}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <label className="label">Edges</label>
                    <ToggleInput
                        name="edges"
                        value={state.edges}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <label className="label">Edge Color</label>
                    <ColorInput
                        name="edgeColor"
                        value={state.edgeColor}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <label className="label">X</label>
                    <NumberInput
                        name="x"
                        size="3"
                        min={-maxVal}
                        max={maxVal}
                        value={state.x}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-maxVal}
                            max={maxVal}
                            value={state.x}
                            onChange={this.onChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Y</label>
                    <NumberInput
                        name="y"
                        size="3"
                        min={-maxVal}
                        max={maxVal}
                        value={state.y}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-maxVal}
                            max={maxVal}
                            value={state.y}
                            onChange={this.onChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Z</label>
                    <NumberInput
                        name="z"
                        size="3"
                        min={-maxVal}
                        max={maxVal}
                        value={state.z}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="z"
                            min={-maxVal}
                            max={maxVal}
                            value={state.z}
                            onChange={this.onChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Opacity</label>
                    <NumberInput
                        name="opacity"
                        size="3"
                        min={0}
                        max={1}
                        step={0.01}
                        value={state.opacity}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1}
                            step={0.01}
                            value={state.opacity}
                            onChange={this.onChange} />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = GeometryControl;
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

const shapes = [
    'Box',
    'Sphere',
    'Dodecahedron',
    'Icosahedron',
    'Octahedron',
    'Tetrahedron',
    'Torus',
    'Torus Knot'
];

const materials = [
    'Basic',
    'Lambert',
    'Normal',
    'Phong',
    'Physical',
    'Points',
    'Standard'
];

const shading = [
    'Smooth',
    'Flat'
];

class GeometryControl extends UIComponent {
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
        let state = this.state,
            maxVal = 500;

        return (
            <Control title="3D GEOMETRY">
                <Row label="Shape">
                    <SelectInput
                        name="shape"
                        size="20"
                        items={shapes}
                        value={state.shape}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Material">
                    <SelectInput
                        name="material"
                        size="20"
                        items={materials}
                        value={state.material}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Shading">
                    <SelectInput
                        name="shading"
                        size="20"
                        items={shading}
                        value={state.shading}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Color">
                    <ColorInput
                        name="color"
                        value={state.color}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Wireframe">
                    <ToggleInput
                        name="wireframe"
                        value={state.wireframe}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Edges">
                    <ToggleInput
                        name="edges"
                        value={state.edges}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Edge Color">
                    <ColorInput
                        name="edgeColor"
                        value={state.edgeColor}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="X">
                    <NumberInput
                        name="x"
                        size="3"
                        min={-maxVal}
                        max={maxVal}
                        value={state.x}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-maxVal}
                            max={maxVal}
                            value={state.x}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Y">
                    <NumberInput
                        name="y"
                        size="3"
                        min={-maxVal}
                        max={maxVal}
                        value={state.y}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-maxVal}
                            max={maxVal}
                            value={state.y}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Z">
                    <NumberInput
                        name="z"
                        size="3"
                        min={-maxVal}
                        max={maxVal}
                        value={state.z}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="z"
                            min={-maxVal}
                            max={maxVal}
                            value={state.z}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Opacity">
                    <NumberInput
                        name="opacity"
                        size="3"
                        min={0}
                        max={1}
                        step={0.01}
                        value={state.opacity}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1}
                            step={0.01}
                            value={state.opacity}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}

module.exports = GeometryControl;
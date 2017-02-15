import React from 'react';

import UIPureComponent from '../UIPureComponent';
import ColorInput from '../inputs/ColorInput';
import NumberInput from '../inputs/NumberInput';
import RangeInput from '../inputs/RangeInput';
import SelectInput from '../inputs/SelectInput';
import ToggleInput from '../inputs/ToggleInput';
import { Control, Row } from './Control';

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

export default class GeometryControl extends UIPureComponent {
    constructor(props) {
        super(props);

        this.state = this.props.display.options;
    }

    onChange(name, val) {
        let obj = {},
            display = this.props.display;

        obj[name] = val;

        this.setState(obj, () => {
            display.update(obj);
        });
    }

    render() {
        let state = this.state,
            maxVal = 500;

        return (
            <Control label="3D GEOMETRY" className={this.props.className}>
                <Row label="Shape">
                    <SelectInput
                        name="shape"
                        width={140}
                        items={shapes}
                        value={state.shape}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Material">
                    <SelectInput
                        name="material"
                        width={140}
                        items={materials}
                        value={state.material}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Shading">
                    <SelectInput
                        name="shading"
                        width={140}
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
                        width={40}
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
                        width={40}
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
                        width={40}
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
                        width={40}
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
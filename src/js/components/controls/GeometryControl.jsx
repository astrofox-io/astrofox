import React from 'react';

import UIPureComponent from 'components/UIPureComponent';
import ColorInput from 'components/inputs/ColorInput';
import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';
import SelectInput from 'components/inputs/SelectInput';
import ToggleInput from 'components/inputs/ToggleInput';
import { Control, Row } from 'components/controls/Control';

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

const MAX_X_RANGE = 500;
const MAX_Y_RANGE = 500;
const MAX_Z_RANGE = 1000;

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
        const { active } = this.props,
            state = this.state;

        return (
            <Control label="3D GEOMETRY" active={active}>
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
                        min={-MAX_X_RANGE}
                        max={MAX_X_RANGE}
                        value={state.x}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-MAX_X_RANGE}
                            max={MAX_X_RANGE}
                            value={state.x}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Y">
                    <NumberInput
                        name="y"
                        width={40}
                        min={-MAX_Y_RANGE}
                        max={MAX_Y_RANGE}
                        value={state.y}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-MAX_Y_RANGE}
                            max={MAX_Y_RANGE}
                            value={state.y}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Z">
                    <NumberInput
                        name="z"
                        width={40}
                        min={-MAX_Z_RANGE}
                        max={MAX_Z_RANGE}
                        value={state.z}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="z"
                            min={-MAX_Z_RANGE}
                            max={MAX_Z_RANGE}
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
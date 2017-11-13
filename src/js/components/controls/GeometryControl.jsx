import React from 'react';

import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option } from 'components/controls/Control';

import ColorInput from 'components/inputs/ColorInput';
import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';
import SelectInput from 'components/inputs/SelectInput';
import ToggleInput from 'components/inputs/ToggleInput';

const SHAPES = [
    'Box',
    'Sphere',
    'Dodecahedron',
    'Icosahedron',
    'Octahedron',
    'Tetrahedron',
    'Torus',
    'Torus Knot'
];

const MATERIALS = [
    'Basic',
    'Lambert',
    'Normal',
    'Phong',
    'Physical',
    'Points',
    'Standard'
];

const SHADING = [
    'Smooth',
    'Flat'
];

const MAX_X_RANGE = 500;
const MAX_Y_RANGE = 500;
const MAX_Z_RANGE = 1000;

export class GeometryControl extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { 
            active, shape, material, shading, color, 
            wireframe, edges, edgeColor, x, y, z, opacity,
            onChange
        } = this.props;

        return (
            <Control label="3D GEOMETRY" active={active}>
                <Option label="Shape">
                    <SelectInput
                        name="shape"
                        width={140}
                        items={SHAPES}
                        value={shape}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Material">
                    <SelectInput
                        name="material"
                        width={140}
                        items={MATERIALS}
                        value={material}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Shading">
                    <SelectInput
                        name="shading"
                        width={140}
                        items={SHADING}
                        value={shading}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Color">
                    <ColorInput
                        name="color"
                        value={color}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Wireframe">
                    <ToggleInput
                        name="wireframe"
                        value={wireframe}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Edges">
                    <ToggleInput
                        name="edges"
                        value={edges}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Edge Color">
                    <ColorInput
                        name="edgeColor"
                        value={edgeColor}
                        onChange={onChange}
                    />
                </Option>
                <Option label="X">
                    <NumberInput
                        name="x"
                        width={40}
                        min={-MAX_X_RANGE}
                        max={MAX_X_RANGE}
                        value={x}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="x"
                        min={-MAX_X_RANGE}
                        max={MAX_X_RANGE}
                        value={x}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Y">
                    <NumberInput
                        name="y"
                        width={40}
                        min={-MAX_Y_RANGE}
                        max={MAX_Y_RANGE}
                        value={y}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="y"
                        min={-MAX_Y_RANGE}
                        max={MAX_Y_RANGE}
                        value={y}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Z">
                    <NumberInput
                        name="z"
                        width={40}
                        min={-MAX_Z_RANGE}
                        max={MAX_Z_RANGE}
                        value={z}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="z"
                        min={-MAX_Z_RANGE}
                        max={MAX_Z_RANGE}
                        value={z}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Opacity">
                    <NumberInput
                        name="opacity"
                        width={40}
                        min={0}
                        max={1}
                        step={0.01}
                        value={opacity}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="opacity"
                        min={0}
                        max={1}
                        step={0.01}
                        value={opacity}
                        onChange={onChange}
                    />
                </Option>
            </Control>
        );
    }
}

export default DisplayControl(GeometryControl);
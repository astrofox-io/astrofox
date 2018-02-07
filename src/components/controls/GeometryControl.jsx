import React, { PureComponent } from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import {
    ColorInput,
    NumberInput,
    RangeInput,
    SelectInput,
    ToggleInput,
} from 'lib/inputs';

const shapeOptions = [
    'Box',
    'Sphere',
    'Dodecahedron',
    'Icosahedron',
    'Octahedron',
    'Tetrahedron',
    'Torus',
    'Torus Knot'
];

const materialOptions = [
    'Basic',
    'Lambert',
    'Normal',
    'Phong',
    'Physical',
    'Points',
    'Standard'
];

const shadingOptions = [
    'Smooth',
    'Flat'
];

const maxXRange = 500;
const maxYRange = 500;
const maxZRange = 1000;

export class GeometryControl extends PureComponent {
    render() {
        const {
            display, active, shape, material, shading, color,
            wireframe, edges, edgeColor, x, y, z, opacity,
            onChange, onReactorChange
        } = this.props;

        return (
            <Control
                label="3D GEOMETRY"
                active={active}
                display={display}>
                <Option>
                    <Label text="Shape" />
                    <SelectInput
                        name="shape"
                        width={140}
                        items={shapeOptions}
                        value={shape}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="Material" />
                    <SelectInput
                        name="material"
                        width={140}
                        items={materialOptions}
                        value={material}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="shading" />
                    <SelectInput
                        name="shading"
                        width={140}
                        items={shadingOptions}
                        value={shading}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="Color" />
                    <ColorInput
                        name="color"
                        value={color}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="Wireframe" />
                    <ToggleInput
                        name="wireframe"
                        value={wireframe}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="Edges" />
                    <ToggleInput
                        name="edges"
                        value={edges}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="Edge Color" />
                    <ColorInput
                        name="edgeColor"
                        value={edgeColor}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="X" />
                    <NumberInput
                        name="x"
                        width={40}
                        min={-maxXRange}
                        max={maxXRange}
                        value={x}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="x"
                        min={-maxXRange}
                        max={maxXRange}
                        value={x}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="Y" />
                    <NumberInput
                        name="y"
                        width={40}
                        min={-maxYRange}
                        max={maxYRange}
                        value={y}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="y"
                        min={-maxYRange}
                        max={maxYRange}
                        value={y}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="Z" />
                    <NumberInput
                        name="z"
                        width={40}
                        min={-maxZRange}
                        max={maxZRange}
                        value={z}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="z"
                        min={-maxZRange}
                        max={maxZRange}
                        value={z}
                        onChange={onChange}
                    />
                </Option>
                <Option
                    reactorName="opacity"
                    onReactorChange={onReactorChange}>
                    <Label text="Opacity" />
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
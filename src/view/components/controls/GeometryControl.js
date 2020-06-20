import React from 'react';
import { Control, Option } from 'components/editing';
import useEntity from 'components/hooks/useEntity';

const shapeOptions = [
  'Box',
  'Sphere',
  'Dodecahedron',
  'Icosahedron',
  'Octahedron',
  'Tetrahedron',
  'Torus',
  'Torus Knot',
];

const materialOptions = ['Basic', 'Lambert', 'Normal', 'Phong', 'Physical', 'Points', 'Standard'];

const shadingOptions = ['Smooth', 'Flat'];

const maxXRange = 500;
const maxYRange = 500;
const maxZRange = 1000;

export default function GeometryControl({ display, active }) {
  const {
    shape,
    material,
    shading,
    color,
    wireframe,
    edges,
    edgeColor,
    x,
    y,
    z,
    opacity,
  } = display.properties;
  const onChange = useEntity(display);

  return (
    <Control label="3D Geometry" active={active} display={display} onChange={onChange}>
      <Option label="Shape" type="select" name="shape" items={shapeOptions} value={shape} />
      <Option
        label="Material"
        type="select"
        name="material"
        items={materialOptions}
        value={material}
      />
      <Option label="Shading" type="select" name="shading" items={shadingOptions} value={shading} />
      <Option label="Color" type="color" name="color" value={color} />
      <Option label="Wireframe" type="toggle" name="wireframe" value={wireframe} />
      <Option label="Edges" type="toggle" name="edges" value={edges} />
      <Option label="Edge Color" type="color" name="edgeColor" value={edgeColor} />
      <Option
        label="X"
        type="number"
        name="x"
        value={x}
        min={-maxXRange}
        max={maxXRange}
        withRange
      />
      <Option
        label="Y"
        type="number"
        name="y"
        value={y}
        min={-maxYRange}
        max={maxYRange}
        withRange
      />
      <Option
        label="Z"
        type="number"
        name="z"
        value={z}
        min={-maxZRange}
        max={maxZRange}
        withRange
      />

      <Option
        label="Opacity"
        type="number"
        name="opacity"
        value={opacity}
        min={0}
        max={1}
        step={0.01}
        withRange
        withReactor
      />
    </Control>
  );
}

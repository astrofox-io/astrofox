// @ts-nocheck

import React from 'react';

export function createGeometryNode(shape, key) {
  switch (shape) {
    case 'Sphere':
      return <sphereGeometry key={key} args={[40, 10, 10]} />;
    case 'Dodecahedron':
      return <dodecahedronGeometry key={key} args={[40, 0]} />;
    case 'Icosahedron':
      return <icosahedronGeometry key={key} args={[40, 0]} />;
    case 'Octahedron':
      return <octahedronGeometry key={key} args={[40, 0]} />;
    case 'Tetrahedron':
      return <tetrahedronGeometry key={key} args={[40, 0]} />;
    case 'Torus':
      return <torusGeometry key={key} args={[50, 20, 10, 10]} />;
    case 'Torus Knot':
      return <torusKnotGeometry key={key} args={[50, 10, 20, 10]} />;
    default:
      return <boxGeometry key={key} args={[50, 50, 50]} />;
  }
}

function PointMaterialNode(props) {
  const handleBeforeCompile = React.useCallback(shader => {
    shader.fragmentShader = shader.fragmentShader.replace(
      'void main() {',
      `void main() {
	vec2 centeredPointCoord = gl_PointCoord - vec2(0.5);
	if (dot(centeredPointCoord, centeredPointCoord) > 0.25) discard;`,
    );
  }, []);

  return <pointsMaterial {...props} alphaTest={0.5} onBeforeCompile={handleBeforeCompile} />;
}

export function getMaterialNode(material, props) {
  switch (material) {
    case 'Basic':
      return <meshBasicMaterial {...props} />;
    case 'Lambert':
      return <meshLambertMaterial {...props} />;
    case 'Normal':
      return <meshNormalMaterial {...props} />;
    case 'Phong':
      return <meshPhongMaterial {...props} />;
    case 'Physical':
      return <meshPhysicalMaterial {...props} />;
    case 'Points':
      return <PointMaterialNode {...props} />;
    default:
      return <meshStandardMaterial {...props} />;
  }
}

export function isPointsMaterial(material) {
  return material === 'Points';
}

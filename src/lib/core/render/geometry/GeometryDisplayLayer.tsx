// @ts-nocheck
import React from "react";
import FFTParser from "@/lib/audio/FFTParser";
import {
	AddEquation,
	CustomBlending,
	DoubleSide,
	FrontSide,
	OneFactor,
	ZeroFactor,
} from "three";
import { getThreeBlending } from "../layers/TexturePlane";

export function createGeometryNode(shape, key) {
	switch (shape) {
		case "Sphere":
			return <sphereGeometry key={key} args={[40, 10, 10]} />;
		case "Dodecahedron":
			return <dodecahedronGeometry key={key} args={[40, 0]} />;
		case "Icosahedron":
			return <icosahedronGeometry key={key} args={[40, 0]} />;
		case "Octahedron":
			return <octahedronGeometry key={key} args={[40, 0]} />;
		case "Tetrahedron":
			return <tetrahedronGeometry key={key} args={[40, 0]} />;
		case "Torus":
			return <torusGeometry key={key} args={[50, 20, 10, 10]} />;
		case "Torus Knot":
			return <torusKnotGeometry key={key} args={[50, 10, 20, 10]} />;
		default:
			return <boxGeometry key={key} args={[50, 50, 50]} />;
	}
}

export function getMaterialNode(material, props) {
	switch (material) {
		case "Basic":
			return <meshBasicMaterial {...props} />;
		case "Lambert":
			return <meshLambertMaterial {...props} />;
		case "Normal":
			return <meshNormalMaterial {...props} />;
		case "Phong":
			return <meshPhongMaterial {...props} />;
		case "Physical":
			return <meshPhysicalMaterial {...props} />;
		default:
			return <meshStandardMaterial {...props} />;
	}
}

export function GeometryDisplayLayer({
	display,
	order,
	frameData,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
}) {
	const { properties = {} } = display;
	const {
		shape = "Box",
		material = "Standard",
		shading = "Smooth",
		color = "#FFFFFF",
		edges = false,
		edgeColor = "#FFFFFF",
		wireframe = false,
		x = 0,
		y = 0,
		z = 0,
		opacity = 1,
		lightIntensity = 1,
		lightDistance = 500,
		cameraZoom = 250,
	} = properties;

	const parserRef = React.useRef(new FFTParser(properties));
	const rotationRef = React.useRef({ x: 0, y: 0, z: 0 });

	parserRef.current.update(properties);

	if (frameData?.hasUpdate && frameData.fft) {
		const fft = parserRef.current.parseFFT(frameData.fft);

		rotationRef.current.x += 5 * (fft[0] || 0);
		rotationRef.current.y += 3 * (fft[3] || 0);
		rotationRef.current.z += 2 * (fft[2] || 0);
	}

	const meshPosition = [x, -y, 0];
	const meshRotation = [
		rotationRef.current.x,
		rotationRef.current.y,
		rotationRef.current.z,
	];
	const baseZoom = cameraZoom > 0 ? 250 / cameraZoom : 1;
	const zDepthScale = 1 + z / 500;
	const zoomScale = baseZoom * Math.max(0.01, zDepthScale);
	const finalOpacity = Math.max(
		0,
		Math.min(1, Number(opacity ?? 1) * Number(sceneOpacity ?? 1)),
	);
	const blending = sceneMask
		? CustomBlending
		: getThreeBlending(sceneBlendMode);
	const geometryColor = sceneMask ? "#000000" : color;
	const edgeOpacity = sceneMask
		? Number(sceneInverse ? 1 : 0)
		: 0.9 * Number(sceneOpacity ?? 1);

	return (
		<group scale={[zoomScale, zoomScale, zoomScale]}>
			<ambientLight intensity={0.3 * lightIntensity} />
			<pointLight
				key="light-0"
				intensity={lightIntensity}
				decay={0}
				position={[0, lightDistance, 0]}
			/>
			<pointLight
				key="light-1"
				intensity={lightIntensity}
				decay={0}
				position={[lightDistance, lightDistance, lightDistance]}
			/>
			<pointLight
				key="light-2"
				intensity={lightIntensity * 0.5}
				decay={0}
				position={[-lightDistance, -lightDistance, -lightDistance]}
			/>
			<mesh
				key="mesh"
				position={meshPosition}
				rotation={meshRotation}
				renderOrder={order}
			>
				{createGeometryNode(shape, "geometry")}
				{getMaterialNode(material, {
					flatShading: shading === "Flat",
					color: geometryColor,
					opacity: finalOpacity,
					wireframe,
					transparent: true,
					side: material === "Basic" ? FrontSide : DoubleSide,
					depthTest: false,
					depthWrite: false,
					blending,
					blendEquation: sceneMask ? AddEquation : undefined,
					blendSrc: sceneMask ? ZeroFactor : undefined,
					blendDst: sceneMask ? OneFactor : undefined,
					blendEquationAlpha: sceneMask ? AddEquation : undefined,
					blendSrcAlpha: sceneMask ? OneFactor : undefined,
					blendDstAlpha: sceneMask ? ZeroFactor : undefined,
				})}
			</mesh>
			{edges && (
				<mesh
					key="edge-overlay"
					position={meshPosition}
					rotation={meshRotation}
					renderOrder={order + 0.01}
				>
					{createGeometryNode(shape, "edge-geometry")}
					<meshBasicMaterial
						color={edgeColor}
						wireframe={true}
						transparent={true}
						opacity={edgeOpacity}
						depthTest={false}
						depthWrite={false}
						blending={blending}
						blendEquation={sceneMask ? AddEquation : undefined}
						blendSrc={sceneMask ? ZeroFactor : undefined}
						blendDst={sceneMask ? OneFactor : undefined}
						blendEquationAlpha={sceneMask ? AddEquation : undefined}
						blendSrcAlpha={sceneMask ? OneFactor : undefined}
						blendDstAlpha={sceneMask ? ZeroFactor : undefined}
					/>
				</mesh>
			)}
		</group>
	);
}

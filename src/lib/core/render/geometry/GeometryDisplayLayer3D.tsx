// @ts-nocheck
import FFTParser from "@/lib/audio/FFTParser";
import React from "react";
import {
	AddEquation,
	CustomBlending,
	DoubleSide,
	FrontSide,
	OneFactor,
	ZeroFactor,
} from "three";
import {
	getThreeBlending,
	requiresPremultipliedAlpha,
} from "../layers/TexturePlane";
import { createGeometryNode, getMaterialNode } from "./GeometryDisplayLayer";

export function GeometryDisplayLayer3D({
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

	const meshPosition = [x, -y, -z];
	const meshRotation = [
		rotationRef.current.x,
		rotationRef.current.y,
		rotationRef.current.z,
	];
	const uniformScale = cameraZoom > 0 ? 250 / cameraZoom : 1;
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
		<group scale={[uniformScale, uniformScale, uniformScale]}>
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
					depthTest: true,
					depthWrite: true,
					premultipliedAlpha: requiresPremultipliedAlpha(sceneBlendMode),
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
						premultipliedAlpha={requiresPremultipliedAlpha(sceneBlendMode)}
						opacity={edgeOpacity}
						depthTest={true}
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

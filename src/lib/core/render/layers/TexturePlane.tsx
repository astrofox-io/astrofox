// @ts-nocheck
import React from "react";
import {
	AddEquation,
	AdditiveBlending,
	CustomBlending,
	MultiplyBlending,
	NormalBlending,
	OneFactor,
	SubtractiveBlending,
	ZeroFactor,
} from "three";
import {
	LUMA,
	MASK_FRAGMENT_SHADER,
	MASK_VERTEX_SHADER,
	toRadians,
} from "../constants";

export function getThreeBlending(blendMode = "Normal") {
	switch (blendMode) {
		case "Add":
			return AdditiveBlending;
		case "Multiply":
			return MultiplyBlending;
		case "Subtract":
			return SubtractiveBlending;
		default:
			return NormalBlending;
	}
}

export function requiresPremultipliedAlpha(blendMode = "Normal") {
	return blendMode === "Multiply" || blendMode === "Subtract";
}

export function TexturePlane({
	texture,
	width,
	height,
	x,
	y,
	originX,
	originY,
	rotation,
	zoom,
	opacity,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
	renderOrder,
}) {
	const position = [x + (width / 2 - originX), -y + (height / 2 - originY), 0];
	const planeWidth = Math.max(1, width);
	const planeHeight = Math.max(1, height);
	const planeScale = [planeWidth * zoom, planeHeight * zoom, 1];
	const finalOpacity = Math.max(
		0,
		Math.min(1, Number(opacity ?? 1) * Number(sceneOpacity ?? 1)),
	);

	if (sceneMask) {
		const blendDstAlpha = sceneMaskCombine === "add" ? OneFactor : ZeroFactor;

		return (
			<mesh
				position={position}
				rotation={[0, 0, -toRadians(rotation)]}
				scale={planeScale}
				renderOrder={renderOrder}
			>
				<planeGeometry args={[1, 1]} />
				<shaderMaterial
					uniforms={{
						map: { value: texture },
						opacity: { value: finalOpacity },
						inverse: { value: sceneInverse ? 1 : 0 },
						luma: { value: LUMA },
					}}
					vertexShader={MASK_VERTEX_SHADER}
					fragmentShader={MASK_FRAGMENT_SHADER}
					transparent={true}
					depthTest={false}
					depthWrite={false}
					blending={CustomBlending}
					blendEquation={AddEquation}
					blendSrc={ZeroFactor}
					blendDst={OneFactor}
					blendEquationAlpha={AddEquation}
					blendSrcAlpha={OneFactor}
					blendDstAlpha={blendDstAlpha}
				/>
			</mesh>
		);
	}

	return (
		<mesh
			position={position}
			rotation={[0, 0, -toRadians(rotation)]}
			scale={planeScale}
			renderOrder={renderOrder}
		>
			<planeGeometry args={[1, 1]} />
			<meshBasicMaterial
				map={texture}
				transparent={true}
				premultipliedAlpha={requiresPremultipliedAlpha(sceneBlendMode)}
				opacity={finalOpacity}
				toneMapped={false}
				depthTest={false}
				depthWrite={false}
				blending={getThreeBlending(sceneBlendMode)}
			/>
		</mesh>
	);
}

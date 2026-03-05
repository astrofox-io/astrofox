// @ts-nocheck
import React from "react";
import { Color } from "three";
import { BLANK_IMAGE } from "@/app/constants";
import {
	FallbackLayer,
	ImageDisplayLayer,
	VideoDisplayLayer,
	TextDisplayLayer,
	ShapeDisplayLayer,
	BarSpectrumDisplayLayer,
	WaveSpectrumDisplayLayer,
	SoundWaveDisplayLayer,
} from "./layers";
import { GeometryDisplayLayer3D, PerspectiveScene3D } from "./geometry";
import { SceneWithEffects } from "./effects";

export default function R3FStageRoot({
	width,
	height,
	backgroundColor,
	scenes,
	useFallback,
	fallbackTexture,
	frameData,
	frameIndex,
}) {
	const bgColor = React.useMemo(
		() => new Color(backgroundColor),
		[backgroundColor],
	);

	if (useFallback) {
		return (
			<>
				<primitive key="background" attach="background" object={bgColor} />
				<FallbackLayer
					key="fallback-layer"
					width={width}
					height={height}
					texture={fallbackTexture}
				/>
			</>
		);
	}

	let order = 1;
	const sceneElements = [];

	for (const scene of scenes || []) {
		if (!scene?.enabled) {
			continue;
		}

		const sceneOpacity = Number(scene.properties?.opacity ?? 1);
		const sceneBlendMode = scene.properties?.blendMode || "Normal";
		const sceneMask = Boolean(scene.properties?.mask);
		const sceneInverse = Boolean(scene.properties?.inverse);
		const enabledDisplayCount = (scene.displays || []).filter(
			(display) => display?.enabled,
		).length;
		const sceneMaskCombine =
			sceneMask && !sceneInverse && enabledDisplayCount > 1 ? "add" : "replace";

		const sceneEffects = (scene.effects || []).filter((e) => e?.enabled);
		const scene2D = [];
		const scene3D = [];
		let scene3DOrder = order; // track first 3D display's order for FBO renderOrder
		let sceneLastOrder = order; // track last display's order for SceneWithEffects renderOrder

		for (const display of scene.displays || []) {
			if (!display?.enabled) {
				continue;
			}

			switch (display.name) {
				case "ImageDisplay": {
					const src = display.properties?.src;
					if (!src || src === BLANK_IMAGE) break;
					scene2D.push(
						<ImageDisplayLayer
							key={display.id}
							display={display}
							order={order}
							sceneOpacity={sceneOpacity}
							sceneBlendMode={sceneBlendMode}
							sceneMask={sceneMask}
							sceneInverse={sceneInverse}
							sceneMaskCombine={sceneMaskCombine}
						/>,
					);
					break;
				}
				case "VideoDisplay":
					scene2D.push(
						<VideoDisplayLayer
							key={display.id}
							display={display}
							order={order}
							sceneOpacity={sceneOpacity}
							sceneBlendMode={sceneBlendMode}
							sceneMask={sceneMask}
							sceneInverse={sceneInverse}
							sceneMaskCombine={sceneMaskCombine}
						/>,
					);
					break;
				case "TextDisplay":
					scene2D.push(
						<TextDisplayLayer
							key={display.id}
							display={display}
							order={order}
							frameData={frameData}
							sceneOpacity={sceneOpacity}
							sceneBlendMode={sceneBlendMode}
							sceneMask={sceneMask}
							sceneInverse={sceneInverse}
							sceneMaskCombine={sceneMaskCombine}
						/>,
					);
					break;
				case "ShapeDisplay":
					scene2D.push(
						<ShapeDisplayLayer
							key={display.id}
							display={display}
							order={order}
							frameData={frameData}
							sceneOpacity={sceneOpacity}
							sceneBlendMode={sceneBlendMode}
							sceneMask={sceneMask}
							sceneInverse={sceneInverse}
							sceneMaskCombine={sceneMaskCombine}
						/>,
					);
					break;
				case "BarSpectrumDisplay":
					scene2D.push(
						<BarSpectrumDisplayLayer
							key={display.id}
							display={display}
							order={order}
							frameData={frameData}
							sceneOpacity={sceneOpacity}
							sceneBlendMode={sceneBlendMode}
							sceneMask={sceneMask}
							sceneInverse={sceneInverse}
							sceneMaskCombine={sceneMaskCombine}
						/>,
					);
					break;
				case "WaveSpectrumDisplay":
					scene2D.push(
						<WaveSpectrumDisplayLayer
							key={display.id}
							display={display}
							order={order}
							frameData={frameData}
							sceneOpacity={sceneOpacity}
							sceneBlendMode={sceneBlendMode}
							sceneMask={sceneMask}
							sceneInverse={sceneInverse}
							sceneMaskCombine={sceneMaskCombine}
						/>,
					);
					break;
				case "SoundWaveDisplay":
					scene2D.push(
						<SoundWaveDisplayLayer
							key={display.id}
							display={display}
							order={order}
							frameData={frameData}
							sceneOpacity={sceneOpacity}
							sceneBlendMode={sceneBlendMode}
							sceneMask={sceneMask}
							sceneInverse={sceneInverse}
							sceneMaskCombine={sceneMaskCombine}
						/>,
					);
					break;
				case "GeometryDisplay":
					if (scene3D.length === 0) scene3DOrder = order;
					scene3D.push(
						<GeometryDisplayLayer3D
							key={display.id}
							display={display}
							order={order}
							frameData={frameData}
							sceneOpacity={sceneOpacity}
							sceneBlendMode={sceneBlendMode}
							sceneMask={sceneMask}
							sceneInverse={sceneInverse}
						/>,
					);
					break;
				default:
					break;
			}
			sceneLastOrder = order;
			order += 1;
		}

		const displayContent = (
			<React.Fragment key={scene.id}>
				{scene3D.length > 0 && (
					<PerspectiveScene3D width={width} height={height} renderOrder={scene3DOrder}>
						{scene3D}
					</PerspectiveScene3D>
				)}
				{scene2D}
			</React.Fragment>
		);

		if (sceneEffects.length > 0) {
			sceneElements.push(
				<SceneWithEffects
					key={scene.id}
					width={width}
					height={height}
					effects={sceneEffects}
					renderOrder={sceneLastOrder}
				>
					{displayContent}
				</SceneWithEffects>,
			);
		} else {
			sceneElements.push(displayContent);
		}
	}

	return (
		<>
			<primitive key="background" attach="background" object={bgColor} />
			{sceneElements}
		</>
	);
}

// @ts-nocheck
import { BLANK_IMAGE } from "@/app/constants";
import { useFrame } from "@react-three/fiber";
import React from "react";
import { SceneWithEffects } from "./effects";
import { GeometryDisplayLayer3D, PerspectiveScene3D } from "./geometry";
import {
	BarSpectrumDisplayLayer,
	ImageDisplayLayer,
	ShapeDisplayLayer,
	SoundWaveDisplayLayer,
	TextDisplayLayer,
	VideoDisplayLayer,
	WaveSpectrumDisplayLayer,
} from "./layers";

const NEUTRAL_SCENE_PROPS = {
	sceneOpacity: 1,
	sceneBlendMode: "Normal",
	sceneMask: false,
	sceneInverse: false,
	sceneMaskCombine: "replace",
};

function ComposerPresenter({ onPresent }) {
	useFrame((state) => {
		onPresent?.(state.gl);
	}, 1);

	return null;
}

export default function HybridStageRoot({
	width,
	height,
	scenes,
	frameData,
	sceneLayersRef,
	onPresent,
}) {
	let order = 1;
	let sceneOrder = 0;
	const sceneProducers = [];

	for (const scene of scenes || []) {
		if (!scene?.enabled) {
			continue;
		}

		const sceneEffects = (scene.effects || []).filter((e) => e?.enabled);
		const scene2D = [];
		const scene3D = [];
		let scene3DOrder = order;

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
							{...NEUTRAL_SCENE_PROPS}
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
							{...NEUTRAL_SCENE_PROPS}
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
							{...NEUTRAL_SCENE_PROPS}
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
							{...NEUTRAL_SCENE_PROPS}
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
							{...NEUTRAL_SCENE_PROPS}
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
							{...NEUTRAL_SCENE_PROPS}
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
							{...NEUTRAL_SCENE_PROPS}
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
							sceneOpacity={1}
							sceneBlendMode="Normal"
							sceneMask={false}
							sceneInverse={false}
						/>,
					);
					break;
				default:
					break;
			}

			order += 1;
		}

		const displayContent = (
			<React.Fragment key={scene.id}>
				{scene3D.length > 0 && (
					<PerspectiveScene3D
						width={width}
						height={height}
						renderOrder={scene3DOrder}
					>
						{scene3D}
					</PerspectiveScene3D>
				)}
				{scene2D}
			</React.Fragment>
		);

		const currentSceneOrder = sceneOrder;
		sceneOrder += 1;

		sceneProducers.push(
			<SceneWithEffects
				key={scene.id}
				width={width}
				height={height}
				effects={sceneEffects}
				frameData={frameData}
				outputToScreen={false}
				onTexture={(texture) => {
					if (!texture) {
						sceneLayersRef.current.delete(scene.id);
						return;
					}

					sceneLayersRef.current.set(scene.id, {
						order: currentSceneOrder,
						properties: scene.properties || {},
						texture,
					});
				}}
			>
				{displayContent}
			</SceneWithEffects>,
		);
	}

	return (
		<>
			{sceneProducers}
			<ComposerPresenter onPresent={onPresent} />
		</>
	);
}

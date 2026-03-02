import { reverse } from "@/lib/utils/array";
import useApp, { setActiveElementId } from "@/lib/view/actions/app";
import useScenes, {
	addScene,
	moveElement,
	removeElement,
	updateElement,
} from "@/lib/view/actions/scenes";
import { ButtonInput } from "@/lib/view/components/inputs";
import ButtonPanel from "@/lib/view/components/layout/ButtonPanel";
import Layout from "@/lib/view/components/layout/Layout";
import SceneLayer from "@/lib/view/components/panels/SceneLayer";
import {
	ChevronDown,
	ChevronUp,
	Picture,
} from "@/lib/view/icons";
import React, { useMemo } from "react";

export default function LayersPanel() {
	const scenes = useScenes((state) => state.scenes);
	const activeElementId = useApp((state) => state.activeElementId);
	const hasScenes = scenes.length > 0;
	const layerSelected = hasScenes && activeElementId;

	const sortedScenes = useMemo(() => reverse(scenes), [scenes]);

	const activeScene = useMemo(() => {
		return scenes.reduce((memo, scene) => {
			if (!memo) {
				if (
					scene?.id === activeElementId ||
					scene?.displays.find((e) => e.id === activeElementId) ||
					scene?.effects.find((e) => e.id === activeElementId)
				) {
					memo = scene;
				}
			}
			return memo;
		}, undefined);
	}, [scenes, activeElementId]);

	function handleLayerClick(id) {
		setActiveElementId(id);
	}

	function handleLayerUpdate(id, prop, value) {
		updateElement(id, prop, value);
	}

	async function handleAddScene() {
		const scene = await addScene();

		setActiveElementId(scene?.id);
	}

	function handleMoveUp() {
		moveElement(activeElementId, 1);
	}
	function handleMoveDown() {
		moveElement(activeElementId, -1);
	}

	function handleRemove(id) {
		if (!id) return;

		const ownerScene = scenes.reduce((memo, scene) => {
			if (!memo) {
				if (
					scene?.id === id ||
					scene?.displays.find((e) => e.id === id) ||
					scene?.effects.find((e) => e.id === id)
				) {
					memo = scene;
				}
			}
			return memo;
		}, undefined);

		if (id === ownerScene?.id) {
			const newScene = sortedScenes.find((e) => e !== ownerScene);
			setActiveElementId(newScene?.id);
		} else if (id === activeElementId) {
			if (ownerScene) {
				const { displays, effects } = ownerScene;
				const element =
					reverse(displays).find((e) => e !== id) ||
					reverse(effects).find((e) => e !== id);

				if (element) {
					setActiveElementId(element?.id);
				} else {
					setActiveElementId(ownerScene?.id);
				}
			}
		}

		removeElement(id);
	}

	return (
		<Layout className={"flex flex-col flex-1 relative overflow-auto"}>
			<ButtonPanel>
				<ButtonInput
					icon={Picture}
					title="Add Scene"
					onClick={handleAddScene}
				/>
				<ButtonInput
					icon={ChevronUp}
					title="Move Layer Up"
					onClick={handleMoveUp}
					disabled={!layerSelected}
				/>
				<ButtonInput
					icon={ChevronDown}
					title="Move Layer Down"
					onClick={handleMoveDown}
					disabled={!layerSelected}
				/>
			</ButtonPanel>
			<div className={"flex-1 overflow-auto pt-1 flex flex-col gap-0.5"}>
				{sortedScenes.map((scene) => (
					<SceneLayer
						key={scene.id}
						scene={scene}
						activeElementId={activeElementId}
						onLayerClick={handleLayerClick}
						onLayerUpdate={handleLayerUpdate}
						onLayerDelete={handleRemove}
					/>
				))}
			</div>
		</Layout>
	);
}

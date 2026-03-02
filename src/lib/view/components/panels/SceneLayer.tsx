import { reverse } from "@/lib/utils/array";
import Layer from "@/lib/view/components/panels/Layer";
import { Cube, DocumentLandscape, Sun, Picture } from "@/lib/view/icons";
import classNames from "classnames";
import React, { useMemo } from "react";

const icons = {
	display: Cube,
	effect: Sun,
	webgl: Cube,
};

export default function SceneLayer({
	scene,
	activeElementId,
	onLayerClick,
	onLayerUpdate,
	onLayerDelete,
}: any) {
	const { id, displayName, enabled } = scene;

	const displays = useMemo(() => reverse(scene.displays), [scene.displays]);
	const effects = useMemo(() => reverse(scene.effects), [scene.effects]);

	const renderLayer = ({ id, type, displayName, enabled }: any) => (
		<Layer
			key={id}
			id={id}
			name={displayName}
			icon={icons[type]}
			className={"pl-[20px]"}
			enabled={enabled}
			active={id === activeElementId}
			onLayerClick={onLayerClick}
			onLayerUpdate={onLayerUpdate}
			onLayerDelete={onLayerDelete}
		/>
	);

	return (
		<div className={"flex flex-col gap-0.5"}>
			<Layer
				key={id}
				id={id}
				name={displayName}
				icon={Picture}
				enabled={enabled}
				active={id === activeElementId}
				onLayerClick={onLayerClick}
				onLayerUpdate={onLayerUpdate}
				onLayerDelete={onLayerDelete}
			/>
			<div className={classNames("flex flex-col gap-0.5")}>
				{effects.map((effect) => renderLayer(effect))}
				{displays.map((display) => renderLayer(display))}
			</div>
		</div>
	);
}

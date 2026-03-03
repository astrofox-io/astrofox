import { reverse } from "@/lib/utils/array";
import Layer from "@/lib/view/components/panels/Layer";
import { Cube, DocumentLandscape, Picture, Sun } from "@/lib/view/icons";
import classNames from "classnames";
import type { LucideIcon } from "lucide-react";
import React, { useMemo } from "react";

const icons: Record<string, LucideIcon> = {
	display: Cube,
	effect: Sun,
	webgl: Cube,
};

interface SceneElement {
	id: string;
	type: string;
	displayName: string;
	enabled: boolean;
}

interface SceneLayerProps {
	scene: {
		id: string;
		displayName: string;
		enabled: boolean;
		displays: SceneElement[];
		effects: SceneElement[];
	};
	activeElementId: string | null;
	onLayerClick?: (id: string) => void;
	onLayerUpdate?: (id: string, prop: string, value: unknown) => void;
	onLayerDelete?: (id: string) => void;
}

export default function SceneLayer({
	scene,
	activeElementId,
	onLayerClick,
	onLayerUpdate,
	onLayerDelete,
}: SceneLayerProps) {
	const { id, displayName, enabled } = scene;

	const displays = useMemo(() => reverse(scene.displays), [scene.displays]);
	const effects = useMemo(() => reverse(scene.effects), [scene.effects]);

	const renderLayer = ({ id, type, displayName, enabled }: SceneElement) => (
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
				{effects.map((effect: SceneElement) => renderLayer(effect))}
				{displays.map((display: SceneElement) => renderLayer(display))}
			</div>
		</div>
	);
}

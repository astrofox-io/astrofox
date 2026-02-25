import { reverse } from "@/lib/utils/array";
import useApp from "@/lib/view/actions/app";
import useScenes from "@/lib/view/actions/scenes";
import Control from "@/lib/view/components/controls/Control";
import { stage } from "@/lib/view/global";
import React, { useMemo, useRef, useEffect } from "react";
import styles from "./ControlsPanel.module.tailwind";

export default function ControlsPanel() {
	const activeElementId = useApp((state) => state.activeElementId);
	const sceneOrder = useScenes((state) => state.sceneOrder);
	const sceneElementsById = useScenes((state) => state.sceneElementsById);
	const panelRef = useRef();

	const displayIds = useMemo(() => {
		const ids = [];

		for (const sceneId of reverse(sceneOrder)) {
			ids.push(sceneId);

			const sceneElements = sceneElementsById[sceneId];
			if (!sceneElements) {
				continue;
			}

			ids.push(...reverse(sceneElements.effects));
			ids.push(...reverse(sceneElements.displays));
		}

		return ids;
	}, [sceneOrder, sceneElementsById]);

	const displays = useMemo(() => {
		return displayIds
			.map((id) => stage.getStageElementById(id))
			.filter((display) => !!display);
	}, [displayIds]);

	useEffect(() => {
		const node = document.getElementById(`control-${activeElementId}`);
		if (node) {
			panelRef.current.scrollTop = node.offsetTop;
		}
	}, [activeElementId]);

	return (
		<div className={styles.panel} ref={panelRef}>
			{displays.map((display) => {
				const { id } = display;

				return (
					<div id={`control-${id}`} key={id} className={styles.control}>
						<Control display={display} />
					</div>
				);
			})}
		</div>
	);
}

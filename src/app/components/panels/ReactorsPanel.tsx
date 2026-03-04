// @ts-nocheck
import useApp, { setActiveReactorId } from "@/app/actions/app";
import useReactors, {
	removeReactor,
	updateReactorProperty,
} from "@/app/actions/reactors";
import Layer from "@/app/components/panels/Layer";
import { reactors } from "@/app/global";
import { Flash } from "@/app/icons";
import React from "react";

export default function ReactorsPanel() {
	const reactorList = useReactors((state) => state.reactors);
	const activeReactorId = useApp((state) => state.activeReactorId);

	function handleLayerClick(id) {
		setActiveReactorId(id);
	}

	function handleLayerUpdate(id, prop, value) {
		updateReactorProperty(id, prop, value);
	}

	function handleLayerDelete(id) {
		const reactor = reactors.getElementById(id);

		if (!reactor) return;

		if (activeReactorId === id) {
			setActiveReactorId(null);
		}

		removeReactor(reactor);
	}

	return (
		<div className="flex flex-col flex-1 relative overflow-auto">
			<div className="flex-1 overflow-auto pt-1 flex flex-col gap-0.5">
				{reactorList.map((reactor) => (
					<Layer
						key={reactor.id}
						id={reactor.id}
						name={reactor.displayName}
						icon={Flash}
						active={reactor.id === activeReactorId}
						enabled={reactor.enabled}
						onLayerClick={handleLayerClick}
						onLayerUpdate={handleLayerUpdate}
						onLayerDelete={handleLayerDelete}
					/>
				))}
			</div>
		</div>
	);
}

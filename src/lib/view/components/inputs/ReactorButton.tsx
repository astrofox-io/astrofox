// @ts-nocheck
import { setActiveReactorId } from "@/lib/view/actions/app";
import { addReactor } from "@/lib/view/actions/reactors";
import { loadScenes } from "@/lib/view/actions/scenes";
import Icon from "@/lib/view/components/interface/Icon";
import { Flash } from "@/lib/view/icons";
import classNames from "classnames";
import React from "react";

export default function ReactorButton({
	display,
	name,
	min = 0,
	max = 1,
	className,
}: any) {
	const reactor = display.getReactor(name);

	async function enableReactor() {
		if (reactor) {
			setActiveReactorId(reactor?.id ?? null);
		} else {
			const newReactor = await addReactor();

			display.setReactor(name, { id: newReactor.id, min, max });

			setActiveReactorId(newReactor?.id ?? null);
			loadScenes();
		}
	}

	return (
		<Icon
			className={classNames("text-text500 w-4 h-4 [&:hover]:text-text100", className, {
				["text-text100"]: reactor,
			})}
			glyph={Flash}
			title={reactor ? "Show Reactor" : "Enable Reactor"}
			onClick={enableReactor}
		/>
	);
}

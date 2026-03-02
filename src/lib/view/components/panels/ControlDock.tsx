import ControlsPanel from "@/lib/view/components/panels/ControlsPanel";
import React from "react";

export default function ControlDock() {
	return (
		<div className="flex flex-col w-[360px] shrink-0 overflow-hidden bg-gray100 border-l border-l-gray75">
			<div className="flex shrink-0 items-start py-3">
				<div className="ml-2.5 cursor-default text-sm uppercase text-text200 leading-none">Controls</div>
			</div>
			<ControlsPanel />
		</div>
	);
}

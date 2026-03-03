import { Tooltip as BaseTooltip } from "@base-ui-components/react/tooltip";
import React from "react";

interface TooltipProps {
	text?: string;
	children: React.ReactElement<Record<string, unknown>>;
}

export default function Tooltip({ text, children }: TooltipProps) {
	if (!text) {
		return children;
	}

	return (
		<BaseTooltip.Provider>
			<BaseTooltip.Root>
				<BaseTooltip.Trigger render={children} />
				<BaseTooltip.Portal>
					<BaseTooltip.Positioner sideOffset={6}>
						<BaseTooltip.Popup className="rounded-md bg-neutral-800 border border-neutral-700 px-2 py-1 text-xs text-neutral-100 shadow-lg z-[100]">
							{text}
						</BaseTooltip.Popup>
					</BaseTooltip.Positioner>
				</BaseTooltip.Portal>
			</BaseTooltip.Root>
		</BaseTooltip.Provider>
	);
}

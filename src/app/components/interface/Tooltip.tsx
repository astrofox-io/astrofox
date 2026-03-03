import {
	Tooltip as TooltipRoot,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type React from "react";

interface TooltipProps {
	text?: string;
	children: React.ReactElement<Record<string, unknown>>;
}

export default function Tooltip({ text, children }: TooltipProps) {
	if (!text) {
		return children;
	}

	return (
		<TooltipProvider>
			<TooltipRoot>
				<TooltipTrigger render={children} />
				<TooltipContent
					side="bottom"
					sideOffset={6}
					className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
				>
					{text}
				</TooltipContent>
			</TooltipRoot>
		</TooltipProvider>
	);
}

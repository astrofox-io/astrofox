import React from "react";

interface PanelHeaderProps {
	title: string;
}

export default function PanelHeader({ title }: PanelHeaderProps) {
	return (
		<div className="flex shrink-0 items-center h-12">
			<div className="ml-2.5 cursor-default text-sm uppercase text-neutral-300 leading-none">
				{title}
			</div>
		</div>
	);
}

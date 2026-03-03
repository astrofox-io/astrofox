import type React from "react";

interface ButtonPanelProps {
	children?: React.ReactNode;
}

export default function ButtonPanel({ children }: ButtonPanelProps) {
	return (
		<div
			className={
				"flex p-1 w-full bg-neutral-900 border-t border-t-neutral-700 border-b border-b-neutral-950 overflow-hidden [&_>_*]:mr-1"
			}
		>
			{children}
		</div>
	);
}

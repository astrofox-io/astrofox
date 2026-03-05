import { Button } from "@/components/ui/button";
import { DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type React from "react";
import { Children, cloneElement, isValidElement } from "react";

interface ModalWindowProps {
	className?: string;
	title?: string;
	buttons?: string[];
	showCloseButton?: boolean;
	onClose?: (value?: string) => void;
	children?: React.ReactNode;
}

export default function ModalWindow({
	className,
	title,
	buttons,
	showCloseButton: _showCloseButton = true,
	onClose,
	children,
}: ModalWindowProps) {
	return (
		<div
			className={cn(
				"relative flex min-h-0 min-w-96 max-w-full max-h-full flex-col overflow-hidden rounded-md",
				className,
			)}
		>
			{title && (
				<div className="shrink-0 border-b border-neutral-700 bg-neutral-800 px-4 py-2.5 text-center">
					<DialogTitle className="cursor-default text-sm uppercase tracking-wider text-neutral-100">
						{title}
					</DialogTitle>
				</div>
			)}
			<div className="relative flex min-h-0 flex-1 flex-col bg-neutral-800">
				{Children.map(children, (child) =>
					isValidElement<{ onClose?: (value?: string) => void }>(child)
						? cloneElement(child, { onClose })
						: child,
				)}
			</div>
			{buttons && (
				<div className="shrink-0 border-t border-neutral-700 bg-neutral-800 px-4 py-3">
					<DialogFooter className="sm:justify-end">
						{buttons.map((text: string, index: number) => (
							<Button
								key={index}
								variant="default"
								size="sm"
								onClick={() => onClose?.(text)}
							>
								{text}
							</Button>
						))}
					</DialogFooter>
				</div>
			)}
		</div>
	);
}

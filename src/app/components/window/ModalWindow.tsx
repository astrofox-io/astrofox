import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type React from "react";
import { Children, cloneElement, isValidElement } from "react";
import { XIcon } from "lucide-react";

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
	showCloseButton = true,
	onClose,
	children,
}: ModalWindowProps) {
	return (
		<div
			className={cn(
				"relative m-auto min-w-96 flex flex-col shadow-2xl rounded-lg overflow-hidden",
				className,
			)}
		>
			{showCloseButton && (
				<Button
					variant="ghost"
					size="icon-xs"
					className="absolute top-0 right-0 z-[1] text-neutral-100 hover:bg-primary"
					onClick={() => onClose?.()}
				>
					<XIcon className="w-3.5 h-3.5" />
				</Button>
			)}
			{title && (
				<div className="relative bg-neutral-800 leading-9 text-center uppercase tracking-wider cursor-default">
					{title}
				</div>
			)}
			<div className="relative min-h-24 bg-neutral-800 flex flex-col">
				{Children.map(children, (child) =>
					isValidElement<{ onClose?: (value?: string) => void }>(child)
						? cloneElement(child, { onClose })
						: child,
				)}
			</div>
			{buttons && (
				<div className="bg-neutral-700 text-center p-2.5">
					{buttons.map((text: string, index: number) => (
						<Button key={index} variant="default" size="sm" onClick={() => onClose?.(text)}>{text}</Button>
					))}
				</div>
			)}
		</div>
	);
}

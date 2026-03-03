import Button from "@/lib/view/components/interface/Button";
import Icon from "@/lib/view/components/interface/Icon";
import { Times } from "@/lib/view/icons";
import classNames from "classnames";
import React, { Children, cloneElement, isValidElement } from "react";

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
		<div className={classNames("relative m-auto min-w-96 flex flex-col shadow-2xl rounded-lg overflow-hidden", className)}>
			{showCloseButton && (
				<div className={"absolute top-0 right-0 h-6 w-6 text-center z-[1] [&_.close-icon]:text-neutral-100 [&_.close-icon]:w-3.5 [&_.close-icon]:h-3.5 [&_.close-icon]:mt-1 [&:hover]:bg-primary"} onClick={() => onClose?.()}>
					<Icon className={""} glyph={Times} />
				</div>
			)}
			{title && <div className={"relative bg-neutral-800 leading-9 text-center uppercase tracking-wider cursor-default"}>{title}</div>}
			<div className={"relative min-h-24 bg-neutral-800 flex flex-col"}>
				{Children.map(children, (child) =>
					isValidElement<{ onClose?: (value?: string) => void }>(child)
						? cloneElement(child, { onClose })
						: child,
				)}
			</div>
			{buttons && (
				<div className={"bg-neutral-700 text-center p-2.5"}>
					{buttons.map((text: string, index: number) => (
						<Button key={index} text={text} onClick={() => onClose?.(text)} />
					))}
				</div>
			)}
		</div>
	);
}

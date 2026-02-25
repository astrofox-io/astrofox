import Button from "@/lib/view/components/interface/Button";
import Icon from "@/lib/view/components/interface/Icon";
import { Times } from "@/lib/view/icons";
import classNames from "classnames";
import React, { Children, cloneElement } from "react";

export default function ModalWindow({
	className,
	title,
	buttons,
	showCloseButton = true,
	onClose,
	children,
}) {
	return (
		<div className={classNames("relative m-auto min-w-96 flex flex-col shadow-[5px_5px_40px_rgba(0,_0,_0,_0.5)]", className)}>
			{showCloseButton && (
				<div className={"absolute top-0 right-0 h-6 w-6 text-center z-[var(--z-index-above)] [&_.close-icon]:text-text100 [&_.close-icon]:w-3.5 [&_.close-icon]:h-3.5 [&_.close-icon]:mt-1 [&:hover]:bg-primary100"} onClick={onClose}>
					<Icon className={""} glyph={Times} />
				</div>
			)}
			{title && <div className={"relative bg-gray200 leading-9 text-center uppercase tracking-wider cursor-default"}>{title}</div>}
			<div className={"relative min-h-24 bg-gray100 flex flex-col"}>
				{Children.map(children, (child) => cloneElement(child, { onClose }))}
			</div>
			{buttons && (
				<div className={"bg-gray300 text-center p-2.5"}>
					{buttons.map((text, index) => (
						<Button key={index} text={text} onClick={() => onClose(text)} />
					))}
				</div>
			)}
		</div>
	);
}

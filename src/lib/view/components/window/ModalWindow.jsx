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
		<div className={classNames("relative m-[auto] min-w-[400px] flex flex-col shadow-[5px_5px_40px_rgba(0,_0,_0,_0.5)]", className)}>
			{showCloseButton && (
				<div className={"absolute top-0 right-0 h-[24px] w-[24px] text-center z-[var(--z-index-above)] [&_.close-icon]:text-[var(--text100)] [&_.close-icon]:w-[14px] [&_.close-icon]:h-[14px] [&_.close-icon]:mt-[5px] [&:hover]:bg-[var(--primary100)]"} onClick={onClose}>
					<Icon className={""} glyph={Times} />
				</div>
			)}
			{title && <div className={"relative bg-[var(--gray200)] leading-[36px] text-center uppercase tracking-[2px] cursor-default"}>{title}</div>}
			<div className={"relative min-h-[100px] bg-[var(--gray100)] flex flex-col"}>
				{Children.map(children, (child) => cloneElement(child, { onClose }))}
			</div>
			{buttons && (
				<div className={"bg-[var(--gray300)] text-center p-[10px]"}>
					{buttons.map((text, index) => (
						<Button key={index} text={text} onClick={() => onClose(text)} />
					))}
				</div>
			)}
		</div>
	);
}

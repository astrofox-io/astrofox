import classNames from "classnames";
import React from "react";

export default function ToggleInput({
	name = "toggle",
	value = false,
	label,
	labelPosition = "right",
	onChange,
}) {
	return (
		<div className={"flex items-center"}>
			<div
				className={classNames(
					"relative order-[1] h-[17px] w-8 shrink-0 rounded-[17px] border border-input-bg bg-input-bg transition-[background-color_0.25s] [&:before]:absolute [&:before]:top-1/2 [&:before]:left-0 [&:before]:-translate-y-1/2 [&:before]:content-[''] [&:before]:h-[15px] [&:before]:w-[15px] [&:before]:rounded-[15px] [&:before]:border [&:before]:border-input-border [&:before]:bg-text100 [&:before]:shadow-[0_0_2px_rgba(0,_0,_0,_0.3)] [&:before]:transition-[left_0.25s]",
					{
						"bg-primary100 [&:before]:left-[15px]": value,
					},
				)}
				onClick={() => onChange(name, !value)}
			/>
			{label && (
				<div
					className={classNames("inline-block shrink-0 whitespace-nowrap", {
						"order-[0] pr-3": labelPosition === "left",
						"order-[2] pl-4": labelPosition === "right",
					})}
				>
					{label}
				</div>
			)}
		</div>
	);
}

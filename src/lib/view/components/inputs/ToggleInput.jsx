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
		<div className={"flex"}>
			<div
				className={classNames(
					"relative h-[17px] w-[32px] rounded-[17px] bg-[var(--input-bg-color)] border border-[var(--input-bg-color)] transition-[background-color_0.25s] order-[1] [&:before]:absolute [&:before]:top-1/2 [&:before]:left-0 [&:before]:-translate-y-1/2 [&:before]:content-[''] [&:before]:w-[15px] [&:before]:h-[15px] [&:before]:rounded-[15px] [&:before]:bg-[var(--text100)] [&:before]:border [&:before]:border-[var(--input-border-color)] [&:before]:shadow-[0_0_2px_rgba(0,_0,_0,_0.3)] [&:before]:transition-[left_0.25s]",
					{
						"bg-[var(--primary100)] [&:before]:left-[15px]": value,
					},
				)}
				onClick={() => onChange(name, !value)}
			/>
			{label && (
				<div
					className={classNames("inline-block", {
						"order-[0] mr-[8px]": labelPosition === "left",
						"order-[2] ml-[8px]": labelPosition === "right",
					})}
				>
					{label}
				</div>
			)}
		</div>
	);
}

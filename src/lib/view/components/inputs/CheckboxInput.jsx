import classNames from "classnames";
import React from "react";

export default function CheckboxInput({
	name = "checkbox",
	value = false,
	label,
	labelPosition = "right",
	onChange,
}) {
	return (
		<div className={"flex items-center"}>
			<div
				className={classNames(
					"order-[1] relative w-[16px] h-[16px] leading-[16px] bg-[var(--input-bg-color)] border border-[var(--input-border-color)] rounded-[var(--input-border-radius)] overflow-hidden [&:before]:content-[''] [&:before]:absolute [&:before]:w-[16px] [&:before]:h-[16px] [&:before]:leading-[16px] [&:before]:text-[var(--text100)] [&:before]:bg-[var(--input-bg-color)] [&:before]:text-[var(--font-size-xsmall)] [&:before]:text-center [&:before]:scale-50 [&:before]:transition-[all_0.3s]",
					{
						"[&:before]:content-['\\2713'] [&:before]:bg-[var(--primary400)] [&:before]:scale-100":
							value,
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

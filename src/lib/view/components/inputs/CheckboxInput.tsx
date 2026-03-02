import classNames from "classnames";
import React from "react";

export default function CheckboxInput({
	name = "checkbox",
	value = false,
	label,
	labelPosition = "right",
	onChange,
}: any) {
	return (
		<div className={"flex items-center"}>
			<div
				className={classNames(
					"order-[1] relative w-4 h-4 leading-4 bg-neutral-900 border border-neutral-600 rounded overflow-hidden [&:before]:content-[''] [&:before]:absolute [&:before]:w-4 [&:before]:h-4 [&:before]:leading-4 [&:before]:text-neutral-100 [&:before]:bg-neutral-900 [&:before]:text-sm [&:before]:text-center [&:before]:scale-50 [&:before]:transition-[all_0.3s]",
					{
						"[&:before]:content-['\\2713'] [&:before]:bg-primary [&:before]:scale-100":
							value,
					},
				)}
				onClick={() => onChange(name, !value)}
			/>
			{label && (
				<div
					className={classNames("inline-block", {
						"order-[0] mr-2": labelPosition === "left",
						"order-[2] ml-2": labelPosition === "right",
					})}
				>
					{label}
				</div>
			)}
		</div>
	);
}

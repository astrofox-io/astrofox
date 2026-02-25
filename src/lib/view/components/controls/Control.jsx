import { resolve } from "@/lib/utils/object";
import { inputValueToProps } from "@/lib/utils/react";
import Option from "@/lib/view/components/controls/Option";
import useEntity from "@/lib/view/hooks/useEntity";
import classNames from "classnames";
import React from "react";

export default function Control({ display, className, showHeader = true }) {
	const {
		displayName,
		constructor: {
			config: { label, controls = {} },
		},
	} = display;

	const onChange = useEntity(display);

	function mapOption(name, option) {
		const props = {};

		for (const [name, value] of Object.entries(option)) {
			props[name] = resolve(value, [display]);
		}

		return (
			<Option
				key={name}
				display={display}
				name={name}
				value={display.properties[name]}
				onChange={inputValueToProps(onChange)}
				{...props}
			/>
		);
	}

	return (
		<div className={classNames("pb-[8px]", className)}>
			{showHeader && (
				<div className={"relative p-[0_10px] h-[30px] cursor-default"}>
					<div className={"flex justify-center text-[var(--font-size-xsmall)] text-[var(--text100)] leading-[30px] overflow-hidden"}>
						<div className={"relative uppercase pr-[20px] [&:after]:content-['\\2022'] [&:after]:absolute [&:after]:right-[7px] [&:after]:text-[var(--text300)]"}>
							{label}
						</div>
						<div className={"text-[var(--text200)] overflow-hidden text-ellipsis whitespace-nowrap min-w-0 max-w-[100px]"}>
							{displayName}
						</div>
					</div>
				</div>
			)}
			{Object.keys(controls).map((key) => mapOption(key, controls[key]))}
		</div>
	);
}

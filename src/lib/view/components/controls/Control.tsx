import { resolve } from "@/lib/utils/object";
import { inputValueToProps } from "@/lib/utils/react";
import Option from "@/lib/view/components/controls/Option";
import useEntity from "@/lib/view/hooks/useEntity";
import classNames from "classnames";
import React from "react";

export default function Control({ display, className, showHeader = true }: any) {
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
		<div className={classNames("pb-2", className)}>
			{showHeader && (
				<div className={"relative py-0 px-2.5 h-8 cursor-default"}>
					<div className={"text-xs flex justify-center text-sm text-text100 leading-8 overflow-hidden"}>
						<div className={"relative uppercase pr-5 [&:after]:content-['\\2022'] [&:after]:absolute [&:after]:right-2 [&:after]:text-text300"}>
							{label}
						</div>
						<div className={"text-text200 overflow-hidden text-ellipsis whitespace-nowrap min-w-0 max-w-24"}>
							{displayName}
						</div>
					</div>
				</div>
			)}
			{Object.keys(controls).map((key) => mapOption(key, controls[key]))}
		</div>
	);
}

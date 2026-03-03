import type Display from "@/lib/core/Display";
import { resolve } from "@/lib/utils/object";
import { inputValueToProps } from "@/lib/utils/react";
import Option from "@/lib/view/components/controls/Option";
import useEntity from "@/lib/view/hooks/useEntity";
import classNames from "classnames";
import React from "react";

interface ControlProps {
	display: Display & {
		displayName: string;
		properties: Record<string, unknown>;
		constructor: {
			config: {
				label: string;
				controls?: Record<string, Record<string, unknown>>;
			};
		};
	};
	className?: string;
	showHeader?: boolean;
}

export default function Control({
	display,
	className,
	showHeader = true,
}: ControlProps) {
	const {
		displayName,
		constructor: {
			config: { label, controls = {} },
		},
	} = display;

	const onChange = useEntity(display);

	function mapOption(name: string, option: Record<string, unknown>) {
		const props: Record<string, unknown> = {};

		for (const [name, value] of Object.entries(option)) {
			props[name] = resolve(value, [display]);
		}

		return (
			<Option
				key={name}
				display={display}
				name={name}
				value={(display.properties as Record<string, unknown>)[name]}
				onChange={inputValueToProps(onChange)}
				{...props}
			/>
		);
	}

	return (
		<div className={classNames("pb-2", className)}>
			{showHeader && (
				<div className={"relative py-2 px-2.5 cursor-default"}>
					<div
						className={
							"flex justify-center text-xs text-neutral-100 leading-8 overflow-hidden"
						}
					>
						<div className={"relative uppercase pr-5"}>{label}</div>
						<div
							className={
								"text-neutral-300 overflow-hidden text-ellipsis whitespace-nowrap min-w-0 max-w-24"
							}
						>
							{displayName}
						</div>
					</div>
				</div>
			)}
			{Object.keys(controls).map((key) => mapOption(key, controls[key]))}
		</div>
	);
}

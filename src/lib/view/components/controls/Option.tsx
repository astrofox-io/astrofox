import inputComponents from "@/lib/view/components/controls/inputComponents";
import {
	RangeInput,
	ReactorButton,
	ReactorInput,
} from "@/lib/view/components/inputs";
import Icon from "@/lib/view/components/interface/Icon";
import { Link } from "@/lib/view/icons";
import classNames from "classnames";
import React from "react";

export default function Option({
	display,
	label,
	type,
	name,
	value,
	className,
	onChange,
	hidden,
	withReactor,
	withRange,
	withLink,
	inputProps,
	...otherProps
}: any) {
	const [InputCompnent, defaultProps] = inputComponents[type] ?? [];
	const showReactor = withReactor && display.getReactor?.(name);
	const { min, max } = otherProps;
	const inputs = [];

	if (showReactor) {
		inputs.push(
			<ReactorInput
				key="reactor"
				display={display}
				name={name}
				value={value}
				width={84}
			/>,
		);
	} else if (InputCompnent) {
		inputs.push(
			<InputCompnent
				key="input"
				{...defaultProps}
				{...inputProps}
				{...otherProps}
				name={name}
				value={value}
				onChange={onChange}
			/>,
		);

		if (withRange) {
			inputs.push(
				<RangeInput
					key="range"
					{...otherProps}
					name={name}
					value={value}
					onChange={onChange}
					smallThumb
				/>,
			);
		}
	}

	return (
		<div
			className={classNames("relative my-0 mx-2.5 flex flex-row items-center gap-2 py-2 px-0 text-sm text-text300 leading-5", className, {
				["hidden"]: hidden || inputs.length === 0,
			})}
		>
			{withReactor && (
				<ReactorButton
					className={"!absolute left-0 top-1/2 -translate-y-1/2"}
					display={display}
					name={name}
					min={min}
					max={max}
				/>
			)}
			<div
				className={classNames("ml-6 flex min-w-28 cursor-default", {
					["min-w-20"]: showReactor,
				})}
			>
				<div
					className={classNames("mr-2 flex-1 overflow-hidden whitespace-nowrap text-ellipsis", {
						["mr-1"]: showReactor,
					})}
				>
					{label}
				</div>
				{withLink && (
					<Icon
						className={classNames("text-text500 w-3 h-3", {
							["text-text100"]: withLink && display.properties[withLink],
						})}
						glyph={Link}
						onClick={() => onChange(withLink, !display.properties[withLink])}
					/>
				)}
			</div>
			{inputs}
		</div>
	);
}

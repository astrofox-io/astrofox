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
}) {
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
			className={classNames("flex flex-row items-center p-[8px_0] m-[0_10px] relative text-[var(--font-size-small)] text-[var(--text300)] leading-[20px] [&_>_*]:mr-[8px] [&_>_*:last-child]:mr-0", className, {
				["hidden"]: hidden || inputs.length === 0,
				["[&_>_*]:mr-[4px] [&_>_*:last-child]:mr-0"]: showReactor,
			})}
		>
			{withReactor && (
				<ReactorButton
					className={"absolute ml-[-5px]"}
					display={display}
					name={name}
					min={min}
					max={max}
				/>
			)}
			<div
				className={classNames("flex ml-[20px] cursor-default min-w-[100px]", {
					["ml-[12px] min-w-[56px]"]: showReactor,
				})}
			>
				<div
					className={classNames("flex-1 whitespace-nowrap [text-overflow:ellipsis] overflow-hidden mr-[8px]", {
						["text-with-reactor mr-[4px]"]: showReactor,
					})}
				>
					{label}
				</div>
				{withLink && (
					<Icon
						className={classNames("text-[var(--text500)] w-[12px] h-[12px]", {
							["text-[var(--text100)]"]: withLink && display.properties[withLink],
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

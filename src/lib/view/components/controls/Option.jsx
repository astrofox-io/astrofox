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
import styles from "./Option.module.tailwind";

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
			className={classNames(styles.option, className, {
				[styles.hidden]: hidden || inputs.length === 0,
				[styles.optionWithReactor]: showReactor,
			})}
		>
			{withReactor && (
				<ReactorButton
					className={styles.reactorIcon}
					display={display}
					name={name}
					min={min}
					max={max}
				/>
			)}
			<div
				className={classNames(styles.label, {
					[styles.labelWithReactor]: showReactor,
				})}
			>
				<div className={styles.text}>{label}</div>
				{withLink && (
					<Icon
						className={classNames(styles.linkIcon, {
							[styles.linkIconActive]: withLink && display.properties[withLink],
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

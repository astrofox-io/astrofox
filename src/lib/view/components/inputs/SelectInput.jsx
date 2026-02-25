import classNames from "classnames";
import React, { useState, useMemo } from "react";

export default function SelectInput({
	name = "select",
	value = "",
	items = [],
	displayField = "label",
	valueField = "value",
	width = 140,
	optionsWidth = "auto",
	className,
	optionsClassName,
	onChange,
}) {
	const [showItems, setShowItems] = useState(false);
	const parsedItems = useMemo(() => {
		return items.map((item) => {
			if (typeof item !== "object") {
				return { [displayField]: item, [valueField]: item };
			}
			return item;
		});
	}, [items]);

	function handleInputClick() {
		setShowItems((state) => !state);
	}

	function handleItemClick(value) {
		return () => {
			setShowItems(false);

			onChange(name, value);
		};
	}

	function handleBlur() {
		setShowItems(false);
	}

	function getDisplayText() {
		let text = "";

		parsedItems.forEach((item) => {
			if (text.length === 0 && item?.[valueField] === value) {
				text = item[displayField];
			}
		});

		return text;
	}

	return (
		<div
			className={classNames(
				"inline-block relative [&:after]:content-[''] [&:after]:absolute [&:after]:rotate-[135deg] [&:after]:h-1.5 [&:after]:w-1.5 [&:after]:right-2.5 [&:after]:bottom-3 [&:after]:border-t [&:after]:border-t-input-text [&:after]:border-r [&:after]:border-r-input-text [&:after]:pointer-events-none",
				className,
			)}
		>
			<input
				type="text"
				className={classNames(
					"cursor-default text-[var(--font-size-small)] text-input-text bg-input-bg border border-input-border rounded-sm leading-6 py-0 px-1.5 outline-none [&:focus]:border [&:focus]:border-primary100 [&:read-only]:border-input-border [&:disabled]:text-text400 [&:disabled]:border-input-border",
					{
						"border-primary100": showItems,
					},
				)}
				name={name}
				style={{ width }}
				value={getDisplayText()}
				onClick={handleInputClick}
				onBlur={handleBlur}
				readOnly
			/>
			<div
				className={classNames(
					"absolute top-full z-[var(--z-index-above)] list-none bg-input-bg overflow-hidden shadow-[0_5px_10px_rgba(0,_0,_0,_0.5)]",
					optionsClassName,
					{
						hidden: !showItems,
					},
				)}
				style={{ width: optionsWidth }}
			>
				{parsedItems.map((item, index) => (
					<div
						key={index}
						className={classNames(
							"text-input-text text-[var(--font-size-small)] leading-6 py-0 px-1.5 min-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap [&:hover]:cursor-default [&:hover]:text-text100 [&:hover]:bg-primary100",
							{
								"relative h-2.5 [&:after]:content-[''] [&:after]:block [&:after]:absolute [&:after]:top-0 [&:after]:left-1.5 [&:after]:right-1.5 [&:after]:bottom-0 [&:after]:m-auto [&:after]:h-px [&:after]:bg-primary100 [&:hover]:bg-transparent":
									!item,
							},
						)}
						style={item?.style}
						onMouseDown={item ? handleItemClick(item[valueField]) : null}
					>
						{item?.[displayField]}
					</div>
				))}
			</div>
		</div>
	);
}

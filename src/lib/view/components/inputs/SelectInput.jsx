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
				"inline-block relative [&:after]:content-[''] [&:after]:absolute [&:after]:rotate-[135deg] [&:after]:h-[6px] [&:after]:w-[6px] [&:after]:right-[10px] [&:after]:bottom-[12px] [&:after]:border-t [&:after]:border-t-[var(--input-text-color)] [&:after]:border-r [&:after]:border-r-[var(--input-text-color)] [&:after]:pointer-events-none",
				className,
			)}
		>
			<input
				type="text"
				className={classNames(
					"cursor-default text-[var(--font-size-small)] text-[var(--input-text-color)] bg-[var(--input-bg-color)] border border-[var(--input-border-color)] rounded-[2px] leading-[24px] p-[0_6px] outline-none [&:focus]:border [&:focus]:border-[var(--primary100)] [&:read-only]:border-[var(--input-border-color)] [&:disabled]:text-[var(--text400)] [&:disabled]:border-[var(--input-border-color)]",
					{
						"border-[var(--primary100)]": showItems,
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
					"absolute top-full z-[var(--z-index-above)] list-none bg-[var(--input-bg-color)] overflow-hidden shadow-[0_5px_10px_rgba(0,_0,_0,_0.5)]",
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
							"text-[var(--input-text-color)] text-[var(--font-size-small)] leading-[24px] p-[0_6px] min-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap [&:hover]:cursor-default [&:hover]:text-[var(--text100)] [&:hover]:bg-[var(--primary100)]",
							{
								"relative h-[10px] [&:after]:content-[''] [&:after]:block [&:after]:absolute [&:after]:top-0 [&:after]:left-[6px] [&:after]:right-[6px] [&:after]:bottom-0 [&:after]:m-auto [&:after]:h-[1px] [&:after]:bg-[var(--primary100)] [&:hover]:bg-transparent":
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

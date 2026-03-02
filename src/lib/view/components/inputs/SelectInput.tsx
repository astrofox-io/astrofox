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
}: any) {
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
				"inline-block relative [&:after]:content-[''] [&:after]:absolute [&:after]:rotate-[135deg] [&:after]:h-1.5 [&:after]:w-1.5 [&:after]:right-2.5 [&:after]:bottom-3 [&:after]:border-t [&:after]:border-t-neutral-300 [&:after]:border-r [&:after]:border-r-neutral-300 [&:after]:pointer-events-none",
				className,
			)}
		>
			<input
				type="text"
				className={classNames(
					"cursor-default text-sm text-neutral-300 bg-neutral-900 border border-neutral-600 rounded-md py-1 px-2 outline-none [&:focus]:border [&:focus]:border-primary [&:read-only]:border-neutral-600 [&:disabled]:text-neutral-500 [&:disabled]:border-neutral-600",
					{
						"border-primary": showItems,
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
					"absolute top-full min-w-36 z-[7] list-none bg-neutral-900 rounded-md border border-neutral-700 shadow-lg mt-1 p-1 flex flex-col gap-0.5",
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
							"text-neutral-300 text-sm py-1 px-2 min-w-36 overflow-hidden text-ellipsis whitespace-nowrap rounded-md [&:hover]:cursor-default [&:hover]:text-neutral-100 [&:hover]:bg-primary",
							{
								"relative h-2.5 [&:after]:content-[''] [&:after]:block [&:after]:absolute [&:after]:top-0 [&:after]:left-1.5 [&:after]:right-1.5 [&:after]:bottom-0 [&:after]:m-auto [&:after]:h-px [&:after]:bg-primary [&:hover]:bg-transparent":
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

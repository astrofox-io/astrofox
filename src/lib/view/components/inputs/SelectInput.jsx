import classNames from "classnames";
import React, { useState, useMemo } from "react";
import styles from "./SelectInput.module.tailwind";

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
		<div className={classNames(styles.select, className)}>
			<input
				type="text"
				className={classNames(styles.input, { [styles.active]: showItems })}
				name={name}
				style={{ width }}
				value={getDisplayText()}
				onClick={handleInputClick}
				onBlur={handleBlur}
				readOnly
			/>
			<div
				className={classNames(styles.options, optionsClassName, {
					[styles.hidden]: !showItems,
				})}
				style={{ width: optionsWidth }}
			>
				{parsedItems.map((item, index) => (
					<div
						key={index}
						className={classNames(styles.option, {
							[styles.separator]: !item,
						})}
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

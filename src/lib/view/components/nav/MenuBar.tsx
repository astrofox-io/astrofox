// @ts-nocheck
import classNames from "classnames";
import React, { useState, useEffect } from "react";

import MenuBarItem from "./MenuBarItem";

export default function MenuBar({
	items = [],
	focused = true,
	onMenuAction = () => {},
}) {
	const [menuItems, setMenuItems] = useState(items);
	const [activeIndex, setActiveIndex] = useState();

	function handleDocumentClick() {
		setActiveIndex(-1);
	}

	function handleClick(index) {
		return () => {
			setActiveIndex(activeIndex === index ? -1 : index);
		};
	}

	function handleMouseOver(index) {
		return () => {
			if (activeIndex > -1) {
				setActiveIndex(index);
			}
		};
	}

	function handleMenuItemClick(item) {
		const { action, checked } = item;

		setActiveIndex(-1);

		if (checked !== undefined) {
			items.forEach((barItem) => {
				if (barItem.submenu) {
					barItem.submenu.forEach((menuItem) => {
						if (action === menuItem.action) {
							menuItem.checked = !menuItem.checked;
							setMenuItems(items.slice());
						}
					});
				}
			});
		}

		onMenuAction(action);
	}

	useEffect(() => {
		window.addEventListener("click", handleDocumentClick);

		return () => {
			window.removeEventListener("click", handleDocumentClick);
		};
	});

	return (
		<div className={classNames("relative text-sm text-text400 bg-gray75 py-0 px-5", { ["text-text300"]: focused })}>
			{menuItems.map(
				({ hidden, label, submenu }, index) =>
					!hidden && (
						<MenuBarItem
							key={index}
							label={label}
							items={submenu}
							active={activeIndex === index}
							onClick={handleClick(index)}
							onMouseOver={handleMouseOver(index)}
							onMenuItemClick={handleMenuItemClick}
						/>
					),
			)}
		</div>
	);
}

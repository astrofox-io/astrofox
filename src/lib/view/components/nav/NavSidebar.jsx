import menuConfig from "@/config/menu.json";
import { handleMenuAction } from "@/view/actions/app";
import { Cube, FolderOpen } from "@phosphor-icons/react";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import Menu from "./Menu";
import styles from "./NavSidebar.module.less";

const NAV_LABELS = ["File", "Edit"];
const EDIT_CANVAS_ACTION = "edit-canvas";

const ICON_MAP = {
	File: FolderOpen,
	Canvas: Cube,
};

function cloneSubmenu(items = []) {
	return items.map((item) => ({ ...item }));
}

function createNavItems() {
	const topLevelItems = menuConfig
		.filter((item) => NAV_LABELS.includes(item.label))
		.map((item) => {
			const submenu = cloneSubmenu(item.submenu);

			if (
				item.label === "Edit" &&
				submenu.length === 1 &&
				submenu[0].action === EDIT_CANVAS_ACTION
			) {
				return {
					label: "Canvas",
					action: EDIT_CANVAS_ACTION,
					submenu: [],
				};
			}

			return {
				label: item.label,
				submenu,
			};
		});

	return topLevelItems.map((item) => ({
		...item,
		submenu: item.submenu.filter((submenuItem, index, list) => {
			if (submenuItem.type !== "separator") {
				return true;
			}

			const prev = list[index - 1];
			const next = list[index + 1];
			return (
				prev && prev.type !== "separator" && next && next.type !== "separator"
			);
		}),
	}));
}

export default function NavSidebar() {
	const [items, setItems] = useState(createNavItems);
	const [activeIndex, setActiveIndex] = useState(-1);

	useEffect(() => {
		function handleWindowClick() {
			setActiveIndex(-1);
		}

		window.addEventListener("click", handleWindowClick);
		return () => window.removeEventListener("click", handleWindowClick);
	}, []);

	function handleToggle(index) {
		return (event) => {
			event.stopPropagation();
			setActiveIndex((current) => (current === index ? -1 : index));
		};
	}

	function handleButtonClick(item, index) {
		if (item.action) {
			return (event) => {
				event.stopPropagation();
				setActiveIndex(-1);
				handleMenuAction(item.action);
			};
		}

		return handleToggle(index);
	}

	function handleMouseOver(index) {
		return (event) => {
			event.stopPropagation();
			setActiveIndex((current) => (current > -1 ? index : current));
		};
	}

	function handleMenuItemClick(menuItem) {
		const { action, checked } = menuItem;

		setActiveIndex(-1);

		if (checked !== undefined) {
			setItems((current) =>
				current.map((group) => ({
					...group,
					submenu: group.submenu.map((item) =>
						item.action === action && item.checked !== undefined
							? { ...item, checked: !item.checked }
							: item,
					),
				})),
			);
		}

		if (action) {
			handleMenuAction(action);
		}
	}

	return (
		<nav className={styles.sidebar} aria-label="Main navigation">
			{items.map((item, index) => {
				const hasMenu = item.submenu.length > 0;
				const isActive = hasMenu && activeIndex === index;
				const Icon = ICON_MAP[item.label] || FolderOpen;

				return (
					<div key={item.label} className={styles.group}>
						<button
							type="button"
							className={classNames(styles.button, {
								[styles.active]: isActive,
							})}
							title={item.label}
							aria-label={item.label}
							onClick={handleButtonClick(item, index)}
							onMouseOver={hasMenu ? handleMouseOver(index) : undefined}
							onFocus={hasMenu ? handleMouseOver(index) : undefined}
						>
							<Icon size={18} weight={isActive ? "fill" : "regular"} />
						</button>
						{hasMenu && (
							<Menu
								className={styles.menu}
								items={item.submenu}
								visible={isActive}
								onMenuItemClick={handleMenuItemClick}
							/>
						)}
					</div>
				);
			})}
		</nav>
	);
}

import menuConfig from "@/lib/config/menu.json";
import { handleMenuAction } from "@/lib/view/actions/app";
import Menu from "@/lib/view/components/nav/Menu";
import WindowButtons from "@/lib/view/components/window/WindowButtons";
import { env } from "@/lib/view/global";
import useWindowState from "@/lib/view/hooks/useWindowState";
import { List } from "@phosphor-icons/react";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import styles from "./TitleBar.module.less";

const NAV_LABELS = ["File", "Edit"];

function cloneSubmenu(items = []) {
	return items.map((item) => ({ ...item }));
}

function createMenuItems() {
	const merged = menuConfig
		.filter((item) => NAV_LABELS.includes(item.label) && !item.hidden)
		.flatMap((item, index) => {
			const submenu = cloneSubmenu(item.submenu);
			if (index === 0) {
				return submenu;
			}

			return [{ type: "separator" }, ...submenu];
		});

	return merged.filter((item, index, list) => {
		if (item.type !== "separator") {
			return true;
		}

		const prev = list[index - 1];
		const next = list[index + 1];
		return (
			prev && prev.type !== "separator" && next && next.type !== "separator"
		);
	});
}

export default function TitleBar() {
	const { focused, maximized } = useWindowState();
	const [menuItems, setMenuItems] = useState(createMenuItems);
	const [menuVisible, setMenuVisible] = useState(false);

	useEffect(() => {
		function closeMenu() {
			setMenuVisible(false);
		}

		window.addEventListener("click", closeMenu);
		return () => window.removeEventListener("click", closeMenu);
	}, []);

	function toggleMenu(event) {
		event.stopPropagation();
		setMenuVisible((visible) => !visible);
	}

	function onMenuItemClick(item) {
		const { action, checked } = item;
		setMenuVisible(false);

		if (checked !== undefined) {
			setMenuItems((current) =>
				current.map((menuItem) =>
					menuItem.action === action && menuItem.checked !== undefined
						? { ...menuItem, checked: !menuItem.checked }
						: menuItem,
				),
			);
		}

		if (action) {
			handleMenuAction(action);
		}
	}

	return (
		<div
			className={classNames(styles.titlebar, {
				[styles.focused]: focused,
			})}
		>
			<div className={styles.controls}>
				<img
					alt=""
					aria-hidden="true"
					className={styles.icon}
					draggable={false}
					src="/icon.svg"
				/>
				<div className={styles.menuWrap}>
					<button
						type="button"
						className={classNames(styles.menuButton, {
							[styles.menuButtonActive]: menuVisible,
						})}
						aria-label="Main menu"
						onClick={toggleMenu}
					>
						<List size={18} weight={menuVisible ? "fill" : "regular"} />
					</button>
					<Menu
						className={styles.menu}
						items={menuItems}
						visible={menuVisible}
						onMenuItemClick={onMenuItemClick}
					/>
				</div>
			</div>
			<div className={styles.title}>{env.APP_NAME}</div>
			{!env.IS_MACOS && (
				<WindowButtons focused={focused} maximized={maximized} />
			)}
		</div>
	);
}

import menuConfig from "@/lib/config/menu.json";
import { handleMenuAction } from "@/lib/view/actions/app";
import Menu from "@/lib/view/components/nav/Menu";
import { env } from "@/lib/view/global";
import useWindowState from "@/lib/view/hooks/useWindowState";
import classNames from "classnames";
import { Menu as MenuIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

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
	const { focused } = useWindowState();
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
			className={"flex items-center relative h-[40px] bg-[var(--gray75)] border-b border-b-[var(--gray300)]"}
		>
			<div className={"flex items-center gap-[0] ml-[6px]"}>
				<div className={"relative"}>
					<button
						type="button"
						className={classNames("w-[28px] h-[28px] border-0 p-0 rounded-[6px] bg-transparent text-[var(--text300)] inline-flex items-center justify-center [&:hover]:text-[var(--text100)] [&:hover]:bg-[var(--gray100)]", {
							["text-[var(--text100)] bg-[var(--primary100)]"]: menuVisible,
						})}
						aria-label="Main menu"
						onClick={toggleMenu}
					>
						<MenuIcon size={18} />
					</button>
					<Menu
						className={"top-[calc(100%_+_6px)] left-0 min-w-[190px] border border-[var(--gray300)]"}
						items={menuItems}
						visible={menuVisible}
						onMenuItemClick={onMenuItemClick}
					/>
				</div>
			</div>
			<div
				className={classNames(
					"absolute left-1/2 -translate-x-1/2 text-[var(--font-size-normal)] leading-[40px] tracking-[5px] uppercase cursor-default max-[700px]:hidden",
					{
						"text-[var(--text300)]": focused,
						"text-[var(--text400)]": !focused,
					},
				)}
			>
				{env.APP_NAME}
			</div>
			<img
				alt=""
				aria-hidden="true"
				className={"absolute top-[6px] right-[8px] w-[28px] h-[28px]"}
				draggable={false}
				src="/icon.svg"
			/>
		</div>
	);
}

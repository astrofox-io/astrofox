// @ts-nocheck
import menuConfig from "@/lib/config/menu.json";
import { handleMenuAction } from "@/lib/view/actions/app";
import classNames from "classnames";
import { Cube, FolderOpen } from "lucide-react";
import React, { useEffect, useState } from "react";
import Menu from "./Menu";

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
		<nav
			className={
				"flex flex-col w-14 shrink-0 py-2 px-1.5 gap-1.5 bg-gray75 border-r border-r-gray300"
			}
			aria-label="Main navigation"
		>
			{items.map((item, index) => {
				const hasMenu = item.submenu.length > 0;
				const isActive = hasMenu && activeIndex === index;
				const Icon = ICON_MAP[item.label] || FolderOpen;

				return (
					<div
						key={item.label}
						className={"group relative flex justify-center"}
					>
						<button
							type="button"
							className={classNames(
								"w-10 h-10 border-0 p-0 rounded-lg bg-transparent text-text300 inline-flex items-center justify-center cursor-default [&:hover]:text-text100 [&:hover]:bg-gray100",
								{
									"text-text100 bg-primary100": isActive,
								},
							)}
							title={item.label}
							aria-label={item.label}
							onClick={handleButtonClick(item, index)}
							onMouseOver={hasMenu ? handleMouseOver(index) : undefined}
							onFocus={hasMenu ? handleMouseOver(index) : undefined}
						>
							<Icon size={16} />
						</button>
						{hasMenu && (
							<Menu
								className={
									"top-0 left-full ml-2 min-w-52 border border-gray300"
								}
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

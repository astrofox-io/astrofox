// @ts-nocheck
import menuConfig from "@/lib/config/menu.json";
import { handleMenuAction } from "@/lib/view/actions/app";
import useProject, { DEFAULT_PROJECT_NAME } from "@/lib/view/actions/project";
import Menu from "@/lib/view/components/nav/Menu";
import { env } from "@/lib/view/global";
import useWindowState from "@/lib/view/hooks/useWindowState";
import classNames from "classnames";
import { Menu as MenuIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

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
	const projectName = useProject((state) => state.projectName);
	const [menuItems, setMenuItems] = useState(createMenuItems);
	const [menuVisible, setMenuVisible] = useState(false);
	const [projectNameEditing, setProjectNameEditing] = useState(false);
	const [projectNameDraft, setProjectNameDraft] = useState(
		projectName || DEFAULT_PROJECT_NAME,
	);
	const projectNameInputRef = useRef(null);

	useEffect(() => {
		function closeMenu() {
			setMenuVisible(false);
		}

		window.addEventListener("click", closeMenu);
		return () => window.removeEventListener("click", closeMenu);
	}, []);

	useEffect(() => {
		if (!projectNameEditing) {
			setProjectNameDraft(projectName || DEFAULT_PROJECT_NAME);
		}
	}, [projectName, projectNameEditing]);

	useEffect(() => {
		if (!projectNameEditing || !projectNameInputRef.current) {
			return;
		}

		projectNameInputRef.current.focus();
		projectNameInputRef.current.select();
	}, [projectNameEditing]);

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

	function beginProjectNameEdit(event) {
		event.stopPropagation();
		setProjectNameDraft(projectName || DEFAULT_PROJECT_NAME);
		setProjectNameEditing(true);
	}

	function cancelProjectNameEdit() {
		setProjectNameDraft(projectName || DEFAULT_PROJECT_NAME);
		setProjectNameEditing(false);
	}

	function commitProjectNameEdit() {
		const nextName = (projectNameDraft || "").trim() || DEFAULT_PROJECT_NAME;
		const currentName = (projectName || DEFAULT_PROJECT_NAME).trim();

		if (nextName !== currentName) {
			useProject.setState({
				projectName: nextName,
				lastModified: Date.now(),
			});
		}

		setProjectNameEditing(false);
	}

	function onProjectNameKeyDown(event) {
		if (event.key === "Enter") {
			event.preventDefault();
			commitProjectNameEdit();
			return;
		}

		if (event.key === "Escape") {
			event.preventDefault();
			cancelProjectNameEdit();
		}
	}

	return (
		<div
			className={
				"flex items-center relative h-10 bg-gray75 border-b border-b-gray300"
			}
		>
			<div className={"flex items-center gap-0.5 ml-1.5 max-w-[45vw]"}>
				<div className={"relative"}>
					<button
						type="button"
						className={classNames(
							"w-7 h-7 border-0 p-0 rounded-md bg-transparent text-text300 inline-flex items-center justify-center [&:hover]:text-text100 [&:hover]:bg-gray100",
							{
								"text-text100 bg-primary100": menuVisible,
							},
						)}
						aria-label="Main menu"
						onClick={toggleMenu}
					>
						<MenuIcon size={18} />
					</button>
					<Menu
						className={"top-full mt-1.5 left-0 min-w-56 border border-gray300"}
						items={menuItems}
						visible={menuVisible}
						onMenuItemClick={onMenuItemClick}
					/>
				</div>
				{projectNameEditing ? (
					<input
						ref={projectNameInputRef}
						className={
							"h-7 px-2 rounded-md bg-gray100 border border-primary100 text-sm text-text100 outline-none w-52 max-w-[32vw]"
						}
						value={projectNameDraft}
						onBlur={commitProjectNameEdit}
						onChange={(event) => setProjectNameDraft(event.target.value)}
						onClick={(event) => event.stopPropagation()}
						onKeyDown={onProjectNameKeyDown}
					/>
				) : (
					<button
						type="button"
						className={
							"h-7 px-2 rounded-md border-0 bg-transparent text-sm text-text300 inline-flex items-center truncate max-w-[32vw] [&:hover]:text-text100 [&:hover]:bg-gray100"
						}
						onClick={beginProjectNameEdit}
						title="Click to rename project"
					>
						{projectName || DEFAULT_PROJECT_NAME}
					</button>
				)}
			</div>
			<div
				className={classNames(
					"absolute left-1/2 -translate-x-1/2 text-sm leading-10 tracking-widest uppercase cursor-default max-[700px]:hidden",
					{
						"text-text300": focused,
						"text-text400": !focused,
					},
				)}
			>
				{env.APP_NAME}
			</div>
			<img
				alt=""
				aria-hidden="true"
				className={"absolute top-1.5 right-2 w-7 h-7"}
				draggable={false}
				src="/icon.svg"
			/>
		</div>
	);
}

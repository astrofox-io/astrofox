// @ts-nocheck
import menuConfig from "@/lib/config/menu.json";
import { handleMenuAction } from "@/app/actions/app";
import useProject, { DEFAULT_PROJECT_NAME } from "@/app/actions/project";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { env } from "@/app/global";
import useWindowState from "@/app/hooks/useWindowState";
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
	const [menuOpen, setMenuOpen] = useState(false);
	const [projectNameEditing, setProjectNameEditing] = useState(false);
	const [projectNameDraft, setProjectNameDraft] = useState(
		projectName || DEFAULT_PROJECT_NAME,
	);
	const projectNameInputRef = useRef(null);

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

	function onMenuItemClick(item) {
		const { action, checked } = item;
		setMenuOpen(false);

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
				"flex items-center relative h-10 bg-neutral-900 border-b border-b-neutral-700"
			}
		>
			<div className={"flex items-center gap-0.5 ml-1.5 max-w-[45vw]"}>
				<DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
					<DropdownMenuTrigger
						render={
							<Button
								variant="ghost"
								size="icon-sm"
								className={`bg-transparent text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 ${menuOpen ? "text-neutral-100 bg-primary" : ""}`}
								aria-label="Main menu"
							/>
						}
					>
						<MenuIcon size={16} />
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="bg-neutral-900 border-neutral-700 rounded-md shadow-lg p-1 min-w-56"
						align="start"
						sideOffset={6}
					>
						{menuItems.map((item, index) => {
							if (item.type === "separator") {
								return (
									<DropdownMenuSeparator
										key={`sep-${index}`}
										className="bg-primary"
									/>
								);
							}

							if (item.checked !== undefined) {
								return (
									<DropdownMenuCheckboxItem
										key={item.label}
										checked={item.checked}
										disabled={item.disabled}
										className="text-sm min-w-44 rounded-md focus:text-neutral-100 focus:bg-primary"
										onClick={() => onMenuItemClick(item)}
									>
										{item.label}
									</DropdownMenuCheckboxItem>
								);
							}

							return (
								<DropdownMenuItem
									key={item.label}
									disabled={item.disabled}
									className="text-sm min-w-44 rounded-md focus:text-neutral-100 focus:bg-primary"
									onClick={() => onMenuItemClick(item)}
								>
									{item.label}
								</DropdownMenuItem>
							);
						})}
					</DropdownMenuContent>
				</DropdownMenu>
				{projectNameEditing ? (
					<input
						ref={projectNameInputRef}
						className={
							"h-7 px-2 rounded-md bg-neutral-800 border border-primary text-sm text-neutral-100 outline-none w-52 max-w-[32vw]"
						}
						value={projectNameDraft}
						onBlur={commitProjectNameEdit}
						onChange={(event) => setProjectNameDraft(event.target.value)}
						onClick={(event) => event.stopPropagation()}
						onKeyDown={onProjectNameKeyDown}
					/>
				) : (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger
								render={
									<Button
										variant="ghost"
										size="sm"
										className="bg-transparent text-neutral-400 truncate max-w-[32vw] hover:text-neutral-100 hover:bg-neutral-800"
										onClick={beginProjectNameEdit}
									/>
								}
							>
								{projectName || DEFAULT_PROJECT_NAME}
							</TooltipTrigger>
							<TooltipContent
								side="bottom"
								sideOffset={6}
								className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
							>
								Click to rename project
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}
			</div>
			<div className="absolute left-1/2 -translate-x-1/2 text-sm leading-10 tracking-widest uppercase cursor-default max-[700px]:hidden text-neutral-400">
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

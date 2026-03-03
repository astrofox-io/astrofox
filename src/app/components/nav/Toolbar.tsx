// @ts-nocheck
import useApp, { setActiveElementId } from "@/app/actions/app";
import useScenes, { addElement } from "@/app/actions/scenes";
import Tooltip from "@/app/components/interface/Tooltip";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { library } from "@/app/global";
import { Cube, Sun } from "@/app/icons";
import React, { useCallback, useMemo, useState } from "react";

const TOOLBAR_ITEMS = [
	{ type: "displays", title: "Add Display", icon: Cube },
	{ type: "effects", title: "Add Effect", icon: Sun },
];

export default function Toolbar() {
	const scenes = useScenes((state) => state.scenes);
	const activeElementId = useApp((state) => state.activeElementId);
	const hasScenes = scenes.length > 0;
	const [openIndex, setOpenIndex] = useState(-1);

	const activeScene = useMemo(() => {
		return scenes.reduce((memo, scene) => {
			if (!memo) {
				if (
					scene?.id === activeElementId ||
					scene?.displays.find((e) => e.id === activeElementId) ||
					scene?.effects.find((e) => e.id === activeElementId)
				) {
					memo = scene;
				}
			}
			return memo;
		}, undefined);
	}, [scenes, activeElementId]);

	const getMenuItems = useCallback((type) => {
		const items = library.get(type);
		if (!items) return [];
		return Object.keys(items).map((key) => ({
			label: items[key].config.label,
			_entityClass: items[key],
		}));
	}, []);

	function handleAddControl(Entity) {
		const entity = new Entity();
		setActiveElementId(entity?.id);
		addElement(entity, activeScene?.id);
	}

	function handleMenuItemClick(menuItem) {
		setOpenIndex(-1);
		if (menuItem._entityClass) {
			handleAddControl(menuItem._entityClass);
		}
	}

	return (
		<div
			className="flex flex-row shrink-0 py-2 gap-1 items-center justify-center"
			aria-label="Tools"
		>
			{TOOLBAR_ITEMS.map((item, index) => {
				const isOpen = openIndex === index;
				const Icon = item.icon;
				const menuItems = getMenuItems(item.type);
				const disabled = !hasScenes;

				return (
					<DropdownMenu
						key={item.type}
						open={isOpen}
						onOpenChange={(open) => {
							if (disabled) return;
							setOpenIndex(open ? index : -1);
						}}
					>
						<Tooltip text={item.title}>
							<DropdownMenuTrigger
								render={
									<button
										type="button"
										className={`border-0 p-3 rounded bg-neutral-800 text-neutral-400 inline-flex items-center justify-center cursor-default ${isOpen ? "text-neutral-100 bg-primary" : ""} ${!disabled ? "[&:hover]:text-neutral-100 [&:hover]:bg-neutral-800" : ""} ${disabled ? "[&_svg]:text-neutral-500" : ""}`}
										aria-label={item.title}
									/>
								}
							>
								<Icon size={18} />
							</DropdownMenuTrigger>
						</Tooltip>
						<DropdownMenuContent
							className="bg-neutral-900 border-neutral-700 rounded-md shadow-lg p-1 min-w-44"
							align="start"
							sideOffset={4}
						>
							{menuItems.map((menuItem) => (
								<DropdownMenuItem
									key={menuItem.label}
									className="text-sm min-w-44 rounded-md focus:text-neutral-100 focus:bg-primary"
									onClick={() => handleMenuItemClick(menuItem)}
								>
									{menuItem.label}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				);
			})}
		</div>
	);
}

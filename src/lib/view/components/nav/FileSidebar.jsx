import menuConfig from "@/lib/config/menu.json";
import { handleMenuAction } from "@/lib/view/actions/app";
import React, { useMemo } from "react";

export default function FileSidebar() {
	const sections = useMemo(() => {
		const fileMenu = menuConfig.find((item) => item.label === "File");
		const submenu = fileMenu?.submenu || [];

		return submenu
			.reduce(
				(result, item) => {
					if (item.type === "separator") {
						if (result[result.length - 1].length > 0) {
							result.push([]);
						}
						return result;
					}

					result[result.length - 1].push(item);
					return result;
				},
				[[]],
			)
			.filter((section) => section.length > 0);
	}, []);

	return (
		<nav className={"flex flex-col w-44 shrink-0 bg-gray75 border-r border-r-gray300 p-2 overflow-auto"} aria-label="File actions">
			<div className={"text-sm text-text200 uppercase tracking-wide mb-2 py-1.5 px-2"}>File</div>
			{sections.map((section) => (
				<div
					key={section.map((item) => item.action).join("-")}
					className={"flex flex-col gap-1 mt-2 pt-[8px] border-t border-t-gray300 [&:first-of-type]:mt-0 [&:first-of-type]:pt-0 [&:first-of-type]:border-t-0"}
				>
					{section.map((item) => (
						<button
							key={item.action}
							type="button"
							className={"bg-transparent border-0 text-text100 text-left text-sm p-2 cursor-default [&:hover]:bg-primary100"}
							onClick={() => handleMenuAction(item.action)}
						>
							{item.label}
						</button>
					))}
				</div>
			))}
		</nav>
	);
}

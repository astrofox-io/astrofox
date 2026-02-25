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
		<nav className={"flex flex-col w-[180px] shrink-0 bg-[var(--gray75)] border-r border-r-[var(--gray300)] p-[8px] overflow-auto"} aria-label="File actions">
			<div className={"text-[var(--font-size-small)] text-[var(--text200)] uppercase tracking-[1px] mb-[8px] p-[6px_8px]"}>File</div>
			{sections.map((section) => (
				<div
					key={section.map((item) => item.action).join("-")}
					className={"flex flex-col gap-[4px] mt-[8px] pt-[8px] border-t border-t-[var(--gray300)] [&:first-of-type]:mt-0 [&:first-of-type]:pt-0 [&:first-of-type]:border-t-0"}
				>
					{section.map((item) => (
						<button
							key={item.action}
							type="button"
							className={"bg-transparent border-0 text-[var(--text100)] text-left text-[var(--font-size-normal)] p-[8px] cursor-default [&:hover]:bg-[var(--primary100)]"}
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

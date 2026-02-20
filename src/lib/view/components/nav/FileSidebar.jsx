import menuConfig from "@/lib/config/menu.json";
import { handleMenuAction } from "@/lib/view/actions/app";
import React, { useMemo } from "react";
import styles from "./FileSidebar.module.less";

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
		<nav className={styles.sidebar} aria-label="File actions">
			<div className={styles.header}>File</div>
			{sections.map((section) => (
				<div
					key={section.map((item) => item.action).join("-")}
					className={styles.section}
				>
					{section.map((item) => (
						<button
							key={item.action}
							type="button"
							className={styles.item}
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

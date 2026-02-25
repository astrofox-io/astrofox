import Menu from "@/lib/view/components/nav/Menu";
import classNames from "classnames";
import React from "react";
import styles from "./MenuBarItem.module.tailwind";

export default function MenuBarItem({
	label,
	items,
	active,
	onClick,
	onMouseOver,
	onMenuItemClick,
}) {
	function handleClick(e) {
		e.stopPropagation();
		onClick();
	}

	function handleMouseOver(e) {
		e.stopPropagation();
		onMouseOver();
	}

	return (
		<div className={styles.item}>
			<div
				className={classNames(styles.text, { [styles.active]: active })}
				onClick={handleClick}
				onMouseOver={handleMouseOver}
			>
				{label}
			</div>
			<Menu items={items} visible={active} onMenuItemClick={onMenuItemClick} />
		</div>
	);
}

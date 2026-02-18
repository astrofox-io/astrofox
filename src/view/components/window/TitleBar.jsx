import menuConfig from "@/config/menu.json";
import { handleMenuAction } from "@/view/actions/app";
import appIcon from "@/view/assets/logo.svg?react";
import Icon from "@/view/components/interface/Icon";
import MenuBar from "@/view/components/nav/MenuBar";
import WindowButtons from "@/view/components/window/WindowButtons";
import { env } from "@/view/global";
import useWindowState from "@/view/hooks/useWindowState";
import classNames from "classnames";
import React from "react";
import styles from "./TitleBar.module.less";

export default function TitleBar() {
	const { focused, maximized } = useWindowState();

	return (
		<div
			className={classNames(styles.titlebar, {
				[styles.focused]: focused,
			})}
		>
			<div className={styles.title}>{env.APP_NAME}</div>
			{!env.IS_MACOS && (
				<>
					<Icon className={styles.icon} glyph={appIcon} monochrome={false} />
					<MenuBar
						items={menuConfig}
						onMenuAction={handleMenuAction}
						focused={focused}
					/>
					<WindowButtons focused={focused} maximized={maximized} />
				</>
			)}
		</div>
	);
}

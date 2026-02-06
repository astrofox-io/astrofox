import { handleMenuAction } from "actions/app";
import classNames from "classnames";
import Icon from "components/interface/Icon";
import MenuBar from "components/nav/MenuBar";
import WindowButtons from "components/window/WindowButtons";
import menuConfig from "config/menu.json";
import useWindowState from "hooks/useWindowState";
import React from "react";
import appIcon from "view/assets/logo.svg?react";
import { env } from "view/global";
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

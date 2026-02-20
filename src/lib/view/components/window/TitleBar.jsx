import appIcon from "@/view/assets/logo.svg";
import Icon from "@/view/components/interface/Icon";
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
					<WindowButtons focused={focused} maximized={maximized} />
				</>
			)}
		</div>
	);
}

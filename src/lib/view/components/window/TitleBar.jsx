import appIcon from "@/app/icon.svg";
import Icon from "@/lib/view/components/interface/Icon";
import WindowButtons from "@/lib/view/components/window/WindowButtons";
import { env } from "@/lib/view/global";
import useWindowState from "@/lib/view/hooks/useWindowState";
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

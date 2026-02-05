import classNames from "classnames";
import React from "react";
import { api, env } from "view/global";
import styles from "./WindowButtons.module.less";

export default function WindowButtons({ focused, maximized }) {
	if (env.IS_WEB) {
		return null;
	}

	function minimize() {
		api.minimizeWindow();
	}

	function maximize() {
		api.maximizeWindow();
	}

	function close() {
		api.closeWindow();
	}

	return (
		<div className={classNames(styles.buttons, { [styles.focused]: focused })}>
			<div
				className={classNames(styles.button, styles.minimize)}
				onClick={minimize}
			/>
			<div
				className={classNames(styles.button, {
					[styles.maximize]: !maximized,
					[styles.restore]: maximized,
				})}
				onClick={maximize}
			/>
			<div
				className={classNames(styles.button, styles.close)}
				onClick={close}
			/>
		</div>
	);
}

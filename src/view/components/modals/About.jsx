import Button from "@/view/components/interface/Button";
import { env } from "@/view/global";
import React from "react";
import styles from "./About.module.less";

const { APP_NAME, APP_VERSION } = env;

export default function About({ onClose }) {
	return (
		<div className={styles.about}>
			<div className={styles.name}>{APP_NAME}</div>
			<div className={styles.version}>{`Version ${APP_VERSION}`}</div>
			<div className={styles.copyright}>{"Copyright \u00A9 Mike Cao"}</div>
			<div className={styles.buttons}>
				<Button text="Close" onClick={onClose} />
			</div>
		</div>
	);
}

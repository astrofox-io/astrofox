import classNames from "classnames";
import React from "react";
import styles from "./Checkmark.module.less";

const Checkmark = ({ size, className }) => (
	<div
		className={classNames(styles.checkmark, className)}
		style={{
			width: `${size}px`,
			height: `${size}px`,
		}}
	>
		<svg className={styles.svg} viewBox="0 0 72 72">
			<circle className={styles.circle} cx="36" cy="36" r="35" />
			<path
				className={styles.path}
				d="M17.417,37.778l9.93,9.909l25.444-25.393"
			/>
		</svg>
	</div>
);

export default Checkmark;

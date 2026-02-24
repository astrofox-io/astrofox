import classNames from "classnames";
import React from "react";
import styles from "./Spinner.module.less";

const Spinner = ({ size, className }) => (
	<div
		className={classNames(styles.spinner, className)}
		style={{
			width: `${size}px`,
			height: `${size}px`,
		}}
	>
		<svg aria-hidden="true" className={styles.svg} viewBox="25 25 50 50">
			<circle
				className={styles.circle}
				cx="50"
				cy="50"
				r="20"
				fill="none"
				strokeWidth="2"
				strokeMiterlimit="10"
			/>
		</svg>
	</div>
);

export default Spinner;

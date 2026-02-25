import classNames from "classnames";
import React from "react";
import { Motion, spring } from "react-motion";
import styles from "./Checkmark.module.tailwind";

const Checkmark = ({ size, className }) => (
	<Motion
		defaultStyle={{ circleOffset: 240, pathOffset: 50 }}
		style={{
			circleOffset: spring(0, {
				stiffness: 130,
				damping: 20,
			}),
			pathOffset: spring(0, {
				stiffness: 180,
				damping: 22,
			}),
		}}
	>
		{({ circleOffset, pathOffset }) => (
			<div
				className={classNames(styles.checkmark, className)}
				style={{
					width: `${size}px`,
					height: `${size}px`,
				}}
			>
				<svg aria-hidden="true" className={styles.svg} viewBox="0 0 72 72">
					<circle
						className={styles.circle}
						cx="36"
						cy="36"
						r="35"
						style={{ strokeDashoffset: circleOffset }}
					/>
					<path
						className={styles.path}
						d="M17.417,37.778l9.93,9.909l25.444-25.393"
						style={{ strokeDashoffset: pathOffset }}
					/>
				</svg>
			</div>
		)}
	</Motion>
);

export default Checkmark;

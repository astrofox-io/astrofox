import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { Motion, spring } from "react-motion";
import styles from "./Spinner.module.less";

const Spinner = ({ size, className }) => {
	const [rotationTarget, setRotationTarget] = useState(0);

	useEffect(() => {
		const id = window.setInterval(() => {
			setRotationTarget((current) => current + 120);
		}, 200);

		return () => window.clearInterval(id);
	}, []);

	return (
		<Motion
			defaultStyle={{ rotate: 0 }}
			style={{
				rotate: spring(rotationTarget, {
					stiffness: 100,
					damping: 20,
				}),
			}}
		>
			{({ rotate }) => (
				<div
					className={classNames(styles.spinner, className)}
					style={{
						width: `${size}px`,
						height: `${size}px`,
						transform: `rotate(${rotate}deg)`,
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
			)}
		</Motion>
	);
};

export default Spinner;

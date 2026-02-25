import classNames from "classnames";
import React from "react";
import { Motion, spring } from "react-motion";

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
				className={classNames("block", className)}
				style={{
					width: `${size}px`,
					height: `${size}px`,
				}}
			>
				<svg aria-hidden="true" className={"inline-block [transform-origin:center_center]"} viewBox="0 0 72 72">
					<circle
						className={"[stroke:var(--primary100)] [stroke-width:2] [fill:none] [stroke-dasharray:240px,_240px] [stroke-dashoffset:240px]"}
						cx="36"
						cy="36"
						r="35"
						style={{ strokeDashoffset: circleOffset }}
					/>
					<path
						className={"[stroke:var(--primary100)] [stroke-width:2] [fill:none] [stroke-dasharray:50px,_50px] [stroke-dashoffset:50px]"}
						d="M17.417,37.778l9.93,9.909l25.444-25.393"
						style={{ strokeDashoffset: pathOffset }}
					/>
				</svg>
			</div>
		)}
	</Motion>
);

export default Checkmark;

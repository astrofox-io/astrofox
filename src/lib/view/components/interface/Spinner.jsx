import classNames from "classnames";
import React from "react";

const Spinner = ({ size, className }) => (
	<div
		className={classNames("relative flex justify-center items-center will-change-transform [animation:spinner-rotate_0.45s_linear_infinite]", className)}
		style={{
			width: `${size}px`,
			height: `${size}px`,
		}}
	>
		<svg aria-hidden="true" className={"w-full h-full [transform-origin:center_center]"} viewBox="25 25 50 50">
			<circle
				className={"stroke-primary100 [stroke-linecap:round] [stroke-dasharray:89,_200] [stroke-dashoffset:-35]"}
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

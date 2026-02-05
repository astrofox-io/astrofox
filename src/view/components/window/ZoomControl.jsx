import useStage, { setZoom, zoomIn, zoomOut, fitToScreen } from "actions/stage";
import React from "react";
import styles from "./ZoomControl.module.less";

export default function Zoom() {
	const { width, height, zoom } = useStage((state) => state);

	return (
		<div className={styles.zoom}>
			<div className={styles.label} onClick={() => setZoom(1)}>
				{`${width} x ${height}`}
			</div>
			<div className={styles.button} onClick={zoomIn}>
				{"\uff0d"}
			</div>
			<input
				className={styles.range}
				type="range"
				name="zoom"
				value={zoom}
				onChange={(e) => setZoom(e.target.value)}
				min={0.1}
				max={1.0}
				step={0.02}
			/>
			<div className={styles.button} onClick={zoomOut}>
				{"\uff0b"}
			</div>
			<div className={styles.value} onClick={fitToScreen}>
				{`${~~(zoom * 100)}%`}
			</div>
		</div>
	);
}

import useStage, {
	setZoom,
	zoomIn,
	zoomOut,
	fitToScreen,
} from "@/view/actions/stage";
import React from "react";
import styles from "./ZoomControl.module.less";

export default function Zoom() {
	const { width, height, zoom } = useStage((state) => state);

	return (
		<div className={styles.zoom}>
			<button type="button" className={styles.label} onClick={() => setZoom(1)}>
				{`${width} x ${height}`}
			</button>
			<button type="button" className={styles.button} onClick={zoomOut}>
				{"\uff0d"}
			</button>
			<input
				className={styles.range}
				type="range"
				name="zoom"
				value={zoom}
				onChange={(e) => setZoom(e.target.value)}
				min={0.1}
				max={3.0}
				step={0.02}
			/>
			<button type="button" className={styles.button} onClick={zoomIn}>
				{"\uff0b"}
			</button>
			<button type="button" className={styles.value} onClick={fitToScreen}>
				{`${~~(zoom * 100)}%`}
			</button>
		</div>
	);
}

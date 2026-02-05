import useAudioStore, { loadAudioFile } from "actions/audio";
import useStage from "actions/stage";
import useVideo from "actions/video";
import RenderPanel from "components/panels/RenderPanel";
import Overlay from "components/window/Overlay";
import React, { useEffect, useRef } from "react";
import { animated, useTransition } from "react-spring";
import { ignoreEvents } from "utils/react";
import { analyzer, stage } from "view/global";
import shallow from "zustand/shallow";
import styles from "./Stage.module.less";

export default function Stage() {
	const [width, height, zoom] = useStage(
		(state) => [state.width, state.height, state.zoom],
		shallow,
	);
	const active = useVideo((state) => state.active);
	const canvas = useRef(null);
	const loading = useAudioStore((state) => state.loading);

	useEffect(() => {
		stage.init(canvas.current);
	}, []);

	async function handleDrop(e) {
		ignoreEvents(e);

		if (active) return;

		const file = e.dataTransfer.files[0];

		if (file) {
			await loadAudioFile(file);
		}
	}

	const style = {
		width: `${width * zoom}px`,
		height: `${height * zoom}px`,
	};

	return (
		<div className={styles.stage}>
			<Overlay show={active} />
			<div className={styles.scroll}>
				<div
					className={styles.canvas}
					onDrop={handleDrop}
					onDragOver={ignoreEvents}
					onDoubleClick={() => console.log(analyzer)}
				>
					<canvas ref={canvas} style={style} />
					<Loading show={loading} />
					<RenderInfo show={active} />
				</div>
			</div>
		</div>
	);
}

const Loading = ({ show }) => {
	const transitions = useTransition(show, {
		from: {
			opacity: 0,
			width: "200px",
			height: "200px",
			margin: "-100px 0 0 -100px",
		},
		enter: {
			opacity: 1,
			width: "100px",
			height: "100px",
			margin: "-50px 0 0 -50px",
		},
		leave: {
			opacity: 0,
			width: "200px",
			height: "200px",
			margin: "-100px 0 0 -100px",
		},
	});

	return transitions(
		(style, item) =>
			item && <animated.div className={styles.loading} style={style} />,
	);
};

const RenderInfo = ({ show, onClose }) => {
	const transitions = useTransition(show, {
		from: { opacity: 0, maxHeight: 0 },
		enter: { opacity: 1, maxHeight: 100 },
		leave: { opacity: 0, maxHeight: 0 },
	});

	return transitions(
		(style, item) =>
			item && (
				<animated.div className={styles.renderInfo} style={style}>
					<RenderPanel onClose={onClose} />
				</animated.div>
			),
	);
};

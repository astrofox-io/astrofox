import useAudioStore, { loadAudioFile } from "actions/audio";
import useStage from "actions/stage";
import React, { useEffect, useRef } from "react";
import { animated, useTransition } from "react-spring";
import { ignoreEvents } from "utils/react";
import { analyzer, renderBackend } from "view/global";
import shallow from "zustand/shallow";
import styles from "./Stage.module.less";

export default function Stage() {
	const [width, height, backgroundColor, zoom] = useStage(
		(state) => [state.width, state.height, state.backgroundColor, state.zoom],
		shallow,
	);
	const canvas = useRef(null);
	const initProps = useRef({ width, height, backgroundColor });
	const loading = useAudioStore((state) => state.loading);

	useEffect(() => {
		const { width, height, backgroundColor } = initProps.current;

		renderBackend.init({
			canvas: canvas.current,
			width,
			height,
			backgroundColor,
		});

		return () => {
			renderBackend.dispose();
		};
	}, []);

	async function handleDrop(e) {
		ignoreEvents(e);

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
			<div className={styles.scroll}>
				<div
					className={styles.canvas}
					onDrop={handleDrop}
					onDragOver={ignoreEvents}
					onDoubleClick={() => console.log(analyzer)}
				>
					<canvas ref={canvas} style={style} />
					<Loading show={loading} />
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

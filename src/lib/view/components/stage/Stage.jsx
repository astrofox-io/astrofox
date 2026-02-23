import { ignoreEvents } from "@/lib/utils/react";
import useAudioStore, { loadAudioFile } from "@/lib/view/actions/audio";
import useStage from "@/lib/view/actions/stage";
import { analyzer, renderBackend } from "@/lib/view/global";
import React, { useEffect, useRef, useState } from "react";
import { Motion, TransitionMotion, spring } from "react-motion";
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
	const [rotationTarget, setRotationTarget] = useState(0);

	useEffect(() => {
		if (!show) {
			return undefined;
		}

		const id = window.setInterval(() => {
			setRotationTarget((current) => current + 120);
		}, 200);

		return () => window.clearInterval(id);
	}, [show]);

	const transitionStyles = show
		? [
				{
					key: "loading",
					style: {
						opacity: spring(1, { stiffness: 150, damping: 18 }),
						size: spring(100, { stiffness: 170, damping: 20 }),
					},
				},
			]
		: [];

	return (
		<TransitionMotion
			styles={transitionStyles}
			willEnter={() => ({ opacity: 0, size: 200 })}
			willLeave={() => ({
				opacity: spring(0, { stiffness: 170, damping: 20 }),
				size: spring(200, { stiffness: 170, damping: 20 }),
			})}
		>
			{(interpolatedStyles) => (
				<>
					{interpolatedStyles.map(({ key, style }) => (
						<Motion
							key={key}
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
									className={styles.loading}
									style={{
										opacity: style.opacity,
										width: `${style.size}px`,
										height: `${style.size}px`,
										transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
									}}
								/>
							)}
						</Motion>
					))}
				</>
			)}
		</TransitionMotion>
	);
};

import { ignoreEvents } from "@/lib/utils/react";
import useAudioStore, { loadAudioFile } from "@/lib/view/actions/audio";
import useStage from "@/lib/view/actions/stage";
import Spinner from "@/lib/view/components/interface/Spinner";
import { analyzer, renderBackend } from "@/lib/view/global";
import React, { useEffect, useRef, useState } from "react";
import shallow from "zustand/shallow";
import styles from "./Stage.module.tailwind";

export default function Stage() {
	const [width, height, backgroundColor, zoom] = useStage(
		(state) => [state.width, state.height, state.backgroundColor, state.zoom],
		shallow,
	);
	const canvas = useRef(null);
	const initProps = useRef({ width, height, backgroundColor });
	const loading = useAudioStore((state) => state.loading);
	const [dropLoading, setDropLoading] = useState(false);

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
			setDropLoading(true);

			// Force one paint so the overlay spinner can appear immediately.
			await new Promise((resolve) => {
				if (typeof window !== "undefined" && window.requestAnimationFrame) {
					window.requestAnimationFrame(() => resolve());
					return;
				}

				setTimeout(() => resolve(), 0);
			});

			try {
				await loadAudioFile(file);
			} finally {
				setDropLoading(false);
			}
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
					onDragEnter={ignoreEvents}
					onDoubleClick={() => console.log(analyzer)}
				>
					<canvas
						ref={canvas}
						style={style}
						onDrop={handleDrop}
						onDragOver={ignoreEvents}
						onDragEnter={ignoreEvents}
					/>
					<Loading show={loading || dropLoading} />
				</div>
			</div>
		</div>
	);
}

const Loading = ({ show }) => {
	const [visible, setVisible] = useState(show);
	const [leaving, setLeaving] = useState(false);
	const leaveTimer = useRef(null);

	useEffect(() => {
		if (leaveTimer.current) {
			window.clearTimeout(leaveTimer.current);
			leaveTimer.current = null;
		}

		if (show) {
			setVisible(true);
			setLeaving(false);
			return undefined;
		}

		if (!visible) {
			return undefined;
		}

		setLeaving(true);
		leaveTimer.current = window.setTimeout(() => {
			setVisible(false);
			setLeaving(false);
			leaveTimer.current = null;
		}, 220);

		return () => {
			if (leaveTimer.current) {
				window.clearTimeout(leaveTimer.current);
				leaveTimer.current = null;
			}
		};
	}, [show, visible]);

	if (!visible) {
		return null;
	}

	return (
		<div className={styles.loadingOverlay}>
			<div
				className={`${styles.loadingSpinnerWrap} ${
					leaving ? styles.loadingSpinnerLeave : ""
				}`}
			>
				<Spinner size={96} />
			</div>
		</div>
	);
};

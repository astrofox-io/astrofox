import { RangeInput } from "components/inputs";
import TimeInfo from "components/player/TimeInfo";
import useSharedState from "hooks/useSharedState";
import React, { useEffect } from "react";
import { player } from "view/global";
import styles from "./ProgressControl.module.less";

const PROGRESS_MAX = 1000;

const initialState = {
	progressPosition: 0,
	seekPosition: 0,
	buffering: false,
};

export default function ProgressControl() {
	const [state, setState] = useSharedState(initialState);
	const { progressPosition, seekPosition, buffering } = state;
	const duration = player.getDuration();
	const disabled = !player.hasAudio();

	function handleProgressChange(value) {
		player.seek(value);
		setState({ progressPosition: value, seekPosition: 0, buffering: false });
	}

	function handleProgressUpdate(value) {
		setState({ seekPosition: value, buffering: true });
	}

	function handlePlayerUpdate() {
		if (player.isPlaying() && !buffering) {
			setState({ progressPosition: player.getPosition() });
		}
	}

	function handlePlayerStop() {
		setState({ progressPosition: 0 });
	}

	useEffect(() => {
		player.on("tick", handlePlayerUpdate);
		player.on("stop", handlePlayerStop);

		return () => {
			player.off("tick", handlePlayerUpdate);
			player.off("stop", handlePlayerStop);
		};
	}, []);

	return (
		<div className={styles.progress}>
			<RangeInput
				className={styles.bar}
				name="progress"
				min={0}
				max={PROGRESS_MAX}
				value={progressPosition * PROGRESS_MAX}
				buffered
				onChange={(name, newValue) =>
					handleProgressChange(newValue / PROGRESS_MAX)
				}
				onUpdate={(name, newValue) =>
					handleProgressUpdate(newValue / PROGRESS_MAX)
				}
				disabled={disabled}
				hideThumb={disabled}
			/>
			<TimeInfo
				currentTime={duration * (seekPosition || progressPosition)}
				totalTime={duration}
			/>
		</div>
	);
}

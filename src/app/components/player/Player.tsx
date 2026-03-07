import React from "react";
import AudioWaveform from "./AudioWaveform";
import PlayButtons from "./PlayButtons";

import ProgressControl from "./ProgressControl";
import ToggleButtons from "./ToggleButtons";
import VolumeControl from "./VolumeControl";

export default function Player() {
	return (
		<div className="shrink-0">
			<AudioWaveform />
			<div
				className={
					"flex flex-row items-center min-w-lg overflow-hidden py-2.5 px-5 bg-neutral-900 border-t border-t-neutral-800 [&_>_div]:mr-5 [&_>_div:last-child]:mr-0"
				}
			>
				<PlayButtons />
				<VolumeControl />
				<ProgressControl />
				<ToggleButtons />
			</div>
		</div>
	);
}

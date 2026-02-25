import Icon from "@/lib/view/components/interface/Icon";
import { player } from "@/lib/view/global";
import useForceUpdate from "@/lib/view/hooks/useForceUpdate";
import { Pause, Play, Stop } from "@/lib/view/icons";
import classNames from "classnames";
import React, { useEffect } from "react";

export default function PlayButtons() {
	const forceUpdate = useForceUpdate();
	const playing = player.isPlaying();

	useEffect(() => {
		player.on("playback-change", forceUpdate);
	}, []);

	function handlePlayButtonClick() {
		player.play();
	}

	function handleStopButtonClick() {
		player.stop();
	}

	return (
		<div className={"whitespace-nowrap"}>
			<div
				className={classNames("text-text100 bg-transparent p-0 mr-1 inline-block [flex-wrap:nowrap] border-[2px] border-gray300 h-10 w-10 rounded-[20px] leading-9 text-center [vertical-align:middle] transition-[all_0.2s] [&:last-child]:mr-0 [&:hover]:border-[2px] [&:hover]:border-primary100 [&:active]:border-text100", {
					["[&_.icon]:w-9 [&_.icon]:h-9 [&_.icon]:ml-0.5"]: !playing,
					["[&_.icon]:w-6 [&_.icon]:h-6 [&_.icon]:m-1.5"]: playing,
				})}
				onClick={handlePlayButtonClick}
			>
				<Icon
					className={""}
					glyph={playing ? Pause : Play}
					title={playing ? "Pause" : "Play"}
				/>
			</div>
			<div
				className={classNames("text-text100 bg-transparent p-0 mr-1 inline-block [flex-wrap:nowrap] border-[2px] border-gray300 h-10 w-10 rounded-[20px] leading-9 text-center [vertical-align:middle] transition-[all_0.2s] [&:last-child]:mr-0 [&:hover]:border-[2px] [&:hover]:border-primary100 [&:active]:border-text100", "[&_.icon]:w-6 [&_.icon]:h-6 [&_.icon]:m-1.5")}
				onClick={handleStopButtonClick}
			>
				<Icon className={""} glyph={Stop} title="Stop" />
			</div>
		</div>
	);
}

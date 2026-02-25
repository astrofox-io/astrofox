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
				className={classNames("text-[var(--text100)] bg-transparent p-0 mr-[4px] inline-block [flex-wrap:nowrap] border-[2px] border-[var(--gray300)] h-[40px] w-[40px] rounded-[20px] leading-[36px] text-center [vertical-align:middle] transition-[all_0.2s] [&:last-child]:mr-0 [&:hover]:border-[2px] [&:hover]:border-[var(--primary100)] [&:active]:[border-color:var(--text100)]", {
					["[&_.icon]:w-[36px] [&_.icon]:h-[36px] [&_.icon]:ml-[2px]"]: !playing,
					["[&_.icon]:w-[24px] [&_.icon]:h-[24px] [&_.icon]:m-[6px]"]: playing,
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
				className={classNames("text-[var(--text100)] bg-transparent p-0 mr-[4px] inline-block [flex-wrap:nowrap] border-[2px] border-[var(--gray300)] h-[40px] w-[40px] rounded-[20px] leading-[36px] text-center [vertical-align:middle] transition-[all_0.2s] [&:last-child]:mr-0 [&:hover]:border-[2px] [&:hover]:border-[var(--primary100)] [&:active]:[border-color:var(--text100)]", "[&_.icon]:w-[24px] [&_.icon]:h-[24px] [&_.icon]:m-[6px]")}
				onClick={handleStopButtonClick}
			>
				<Icon className={""} glyph={Stop} title="Stop" />
			</div>
		</div>
	);
}

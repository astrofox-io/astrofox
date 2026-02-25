import { formatTime } from "@/lib/utils/format";
import React from "react";

export default function TimeInfo({ currentTime, totalTime }) {
	return (
		<div className={"flex items-center leading-9 whitespace-nowrap [&:hover]:cursor-default"}>
			<div className={"text-[var(--text100)]"}>{formatTime(currentTime)}</div>
			<div className={"inline-flex h-[30px] border-r border-r-[var(--primary100)] my-0 mx-2 rotate-[20deg]"} />
			<div className={"text-[var(--text200)]"}>{formatTime(totalTime)}</div>
		</div>
	);
}

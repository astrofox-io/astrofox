import { formatTime } from "@/lib/utils/format";
import React from "react";

export default function TimeInfo({ currentTime, totalTime }) {
	return (
		<div className={"flex items-center leading-[36px] whitespace-nowrap [&:hover]:cursor-default"}>
			<div className={"text-[var(--text100)]"}>{formatTime(currentTime)}</div>
			<div className={"inline-flex h-[30px] border-r border-r-[var(--primary100)] m-[0_8px] rotate-[20deg]"} />
			<div className={"text-[var(--text200)]"}>{formatTime(totalTime)}</div>
		</div>
	);
}

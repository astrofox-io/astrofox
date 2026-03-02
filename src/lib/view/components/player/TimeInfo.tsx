import { formatTime } from "@/lib/utils/format";
import React from "react";

export default function TimeInfo({ currentTime, totalTime }: any) {
	return (
		<div className={"flex items-center leading-9 whitespace-nowrap [&:hover]:cursor-default"}>
			<div className={"text-neutral-100"}>{formatTime(currentTime)}</div>
			<div className={"inline-flex h-8 border-r border-r-primary my-0 mx-2 rotate-[20deg]"} />
			<div className={"text-neutral-300"}>{formatTime(totalTime)}</div>
		</div>
	);
}

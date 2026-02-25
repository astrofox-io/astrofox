import { formatSize } from "@/lib/utils/format";
import useAppStore from "@/lib/view/actions/app";
import ZoomControl from "@/lib/view/components/window/ZoomControl";
import { env, renderer } from "@/lib/view/global";
import React, { useState, useEffect } from "react";

const { APP_VERSION } = env;

export default function StatusBar() {
	const statusText = useAppStore((state) => state.statusText);
	const [{ mem, fps }, setState] = useState({});

	function updateStats() {
		setState({
			fps: `${renderer.getFPS()} FPS`,
			mem: formatSize(window.performance.memory.usedJSHeapSize, 2),
		});
	}

	useEffect(() => {
		const id = window.setInterval(updateStats, 500);

		return () => {
			window.clearInterval(id);
		};
	}, []);

	return (
		<div className={"flex text-[var(--text100)] bg-[var(--primary100)] text-[11px] p-[0_20px] cursor-default whitespace-nowrap z-[var(--z-index-above)]"}>
			<div className={"text-left w-[33%] [&_.item]:mr-[20px]"}>
				<InfoItem value={statusText} />
			</div>
			<div className={"text-center flex-1 w-[34%] [&_.item]:m-[0_10px]"}>
				<ZoomControl />
			</div>
			<div className={"text-right w-[33%] [&_.item]:ml-[20px]"}>
				{process.env.NODE_ENV !== "production" && <InfoItem value={mem} />}
				<InfoItem value={fps} />
				<InfoItem value={APP_VERSION} />
			</div>
		</div>
	);
}

function InfoItem({ value }) {
	return <span className={"inline-block leading-[28px]"}>{value}</span>;
}

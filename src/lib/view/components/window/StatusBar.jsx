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
		<div className={"flex text-text100 bg-primary100 text-sm py-0 px-5 cursor-default whitespace-nowrap z-[var(--z-index-above)]"}>
			<div className={"text-left w-1/3 [&_.item]:mr-5"}>
				<InfoItem value={statusText} />
			</div>
			<div className={"text-center flex-1 w-1/3 [&_.item]:my-0 mx-2.5"}>
				<ZoomControl />
			</div>
			<div className={"flex w-1/3 items-center justify-end gap-5 text-right"}>
				{process.env.NODE_ENV !== "production" && <InfoItem value={mem} />}
				<InfoItem value={fps} />
				<InfoItem value={APP_VERSION} />
			</div>
		</div>
	);
}

function InfoItem({ value }) {
	return <span className={"inline-block leading-7"}>{value}</span>;
}

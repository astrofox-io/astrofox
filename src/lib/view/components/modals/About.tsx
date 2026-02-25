import Button from "@/lib/view/components/interface/Button";
import { env } from "@/lib/view/global";
import React from "react";

const { APP_NAME, APP_VERSION } = env;

export default function About({ onClose }: any) {
	return (
		<div className={"text-text100 text-center cursor-default p-8 bg-[url(/images/about_bg.jpg)_no-repeat_center_center_fixed]"}>
			<div className={"[font-family:var(--font-oswald),_sans-serif] font-[100] text-2xl uppercase tracking-widest mb-8"}>{APP_NAME}</div>
			<div className={"mb-1"}>{`Version ${APP_VERSION}`}</div>
			<div className={"mb-8 text-text200"}>{"Copyright \u00A9 Mike Cao"}</div>
			<div className={"mt-5"}>
				<Button text="Close" onClick={onClose} />
			</div>
		</div>
	);
}

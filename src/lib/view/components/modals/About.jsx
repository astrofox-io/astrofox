import Button from "@/lib/view/components/interface/Button";
import { env } from "@/lib/view/global";
import React from "react";

const { APP_NAME, APP_VERSION } = env;

export default function About({ onClose }) {
	return (
		<div className={"text-[var(--text100)] text-center cursor-default p-[30px] bg-[url(/images/about_bg.jpg)_no-repeat_center_center_fixed]"}>
			<div className={"[font-family:var(--font-oswald),_sans-serif] font-[100] text-[24px] uppercase tracking-[4px] mb-[30px]"}>{APP_NAME}</div>
			<div className={"mb-[5px]"}>{`Version ${APP_VERSION}`}</div>
			<div className={"mb-[30px] text-[var(--text200)]"}>{"Copyright \u00A9 Mike Cao"}</div>
			<div className={"mt-5"}>
				<Button text="Close" onClick={onClose} />
			</div>
		</div>
	);
}

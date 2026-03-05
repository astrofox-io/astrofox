import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { env } from "@/app/global";
import React from "react";

const { APP_NAME, APP_VERSION } = env;

interface AboutProps {
	onClose?: () => void;
}

export default function About({ onClose }: AboutProps) {
	return (
		<div className="flex min-h-[16rem] w-[36rem] max-w-full flex-1 flex-col">
			<div
				className={
					"flex flex-1 flex-col items-center justify-center bg-[url(/images/about_bg.jpg)_no-repeat_center_center_fixed] p-8 text-center text-neutral-100"
				}
			>
				<div
					className={
						"[font-family:var(--font-oswald),_sans-serif] mb-8 text-2xl font-[100] uppercase tracking-widest"
					}
				>
					{APP_NAME}
				</div>
				<div className="mb-1">{`Version ${APP_VERSION}`}</div>
				<div className="mb-2 text-neutral-300">{"Copyright \u00A9 Mike Cao"}</div>
			</div>
			<div className="shrink-0 border-t border-neutral-700 bg-neutral-800 px-4 py-3">
				<DialogFooter className="sm:justify-end">
					<Button variant="default" size="sm" onClick={onClose}>
						Close
					</Button>
				</DialogFooter>
			</div>
		</div>
	);
}

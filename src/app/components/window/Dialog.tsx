import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import classNames from "classnames";
import type { LucideIcon } from "lucide-react";
import React from "react";

interface DialogProps {
	icon?: LucideIcon | string;
	message?: string;
	buttons?: string[];
	onConfirm?: (button: string) => void;
}

export default function Dialog({
	icon,
	message,
	buttons,
	onConfirm,
}: DialogProps) {
	return (
		<div className="flex min-h-[12rem] w-full max-w-[38rem] flex-col cursor-default">
			<div className="flex flex-1 items-start gap-4 px-6 py-6">
				{icon && (
					<div
						className={classNames(
							"mt-1 text-3xl",
							typeof icon === "string" ? icon : undefined,
						)}
					/>
				)}
				<div className="flex-1 text-sm leading-6 text-neutral-100">{message}</div>
			</div>
			{buttons && (
				<div className="shrink-0 border-t border-neutral-700 bg-neutral-800 px-4 py-3">
					<DialogFooter className="sm:justify-end">
					{buttons.map((button: string) => (
						<Button
							key={button}
							variant="default"
							size="sm"
							onClick={() => onConfirm?.(button)}
						>
							{button}
						</Button>
					))}
					</DialogFooter>
				</div>
			)}
		</div>
	);
}

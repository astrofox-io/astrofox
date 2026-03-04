import Icon from "@/app/components/interface/Icon";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import classNames from "classnames";
import type { LucideIcon } from "lucide-react";
import React from "react";

interface ButtonInputProps {
	title?: string;
	icon?: LucideIcon;
	text?: string;
	active?: boolean;
	disabled?: boolean;
	onClick?: (() => void) | null;
	className?: string;
}

const ButtonInput = ({
	title,
	icon,
	text,
	active,
	disabled,
	onClick,
	className,
}: ButtonInputProps) => (
	<TooltipProvider>
		<Tooltip>
			<TooltipTrigger
				render={
					<div
						className={classNames(
							"text-neutral-100 bg-neutral-900 min-h-6 min-w-6 text-center rounded-md inline-flex justify-center items-center cursor-default shrink-0 [&:hover]:bg-primary",
							{
								"bg-primary": active,
								"opacity-30 hover:!bg-neutral-900": disabled,
							},
							className,
						)}
						onClick={disabled ? undefined : (onClick ?? undefined)}
					/>
				}
			>
				{icon && <Icon className={"text-neutral-100 w-4 h-4"} glyph={icon} />}
				{text && <span className={"text-sm"}>{text}</span>}
			</TooltipTrigger>
			{title && (
				<TooltipContent
					side="bottom"
					sideOffset={6}
					className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
				>
					{title}
				</TooltipContent>
			)}
		</Tooltip>
	</TooltipProvider>
);

export default ButtonInput;

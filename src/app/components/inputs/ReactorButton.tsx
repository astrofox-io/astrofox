import { setActiveReactorId } from "@/app/actions/app";
import { addReactor } from "@/app/actions/reactors";
import { loadScenes } from "@/app/actions/scenes";
import { reactors } from "@/app/global";
import { Flash, Plus } from "@/app/icons";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type Display from "@/lib/core/Display";
import classNames from "classnames";
import React from "react";

interface ReactorButtonProps {
	display: Display;
	name: string;
	min?: number;
	max?: number;
	className?: string;
}

export default function ReactorButton({
	display,
	name,
	min = 0,
	max = 1,
	className,
}: ReactorButtonProps) {
	const reactor = display.getReactor(name);

	function assignReactor(reactorId: string) {
		display.setReactor(name, { id: reactorId, min, max });
		setActiveReactorId(reactorId);
		loadScenes();
	}

	function createAndAssign() {
		const newReactor = addReactor() as { id: string } | undefined;
		if (newReactor) {
			assignReactor(newReactor.id);
		}
	}

	function handleClick() {
		if (reactor) {
			setActiveReactorId(reactor.id);
		} else {
			createAndAssign();
		}
	}

	const buttonClasses = classNames(
		"min-h-5 min-w-5 rounded inline-flex justify-center items-center cursor-default shrink-0 border-0 bg-transparent p-0",
		reactor
			? "bg-primary text-neutral-100"
			: "text-neutral-500 [&:hover]:text-neutral-100",
	);

	const tooltipLabel = reactor ? "Show Reactor" : "Enable Reactor";

	// When no reactor assigned and reactors exist, show dropdown to pick one
	if (!reactor && reactors.length > 0) {
		return (
			<div className={classNames("relative", className)}>
				<DropdownMenu>
					<TooltipProvider>
						<Tooltip>
							<DropdownMenuTrigger
								render={
									<TooltipTrigger
										render={
											<button type="button" className={buttonClasses} />
										}
									>
										<Flash className="w-3.5 h-3.5" />
									</TooltipTrigger>
								}
							/>
							<TooltipContent
								side="bottom"
								sideOffset={6}
								className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
							>
								{tooltipLabel}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<DropdownMenuContent side="bottom" align="start" sideOffset={4}>
						{reactors.map((r: { id: string; displayName: string }) => (
							<DropdownMenuItem
								key={r.id}
								onClick={() => assignReactor(r.id)}
							>
								<Flash className="w-3.5 h-3.5 text-neutral-400" />
								{r.displayName}
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={createAndAssign}>
							<Plus className="w-3.5 h-3.5 text-neutral-400" />
							New Reactor
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		);
	}

	// Otherwise, simple click: show assigned reactor or create new one
	return (
		<div className={classNames("relative", className)}>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger
						render={
							<button
								type="button"
								className={buttonClasses}
								onClick={handleClick}
							/>
						}
					>
						<Flash className="w-3.5 h-3.5" />
					</TooltipTrigger>
					<TooltipContent
						side="bottom"
						sideOffset={6}
						className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
					>
						{tooltipLabel}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}

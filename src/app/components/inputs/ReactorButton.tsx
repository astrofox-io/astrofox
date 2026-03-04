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

	const buttonClasses = classNames(
		"min-h-5 min-w-5 rounded inline-flex justify-center items-center cursor-default shrink-0 border-0 p-0",
		reactor
			? "bg-primary text-neutral-100"
			: "bg-transparent text-neutral-500 [&:hover]:text-neutral-100",
	);

	// When no reactor assigned and reactors exist, show dropdown to pick one
	if (!reactor && reactors.length > 0) {
		return (
			<div className={classNames("relative", className)}>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<button type="button" className={buttonClasses}>
								<Flash className="w-3.5 h-3.5" />
							</button>
						}
					/>
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

	// No reactor and no existing reactors: simple click to create
	if (!reactor) {
		return (
			<div className={classNames("relative", className)}>
				<button
					type="button"
					className={buttonClasses}
					onClick={createAndAssign}
				>
					<Flash className="w-3.5 h-3.5" />
				</button>
			</div>
		);
	}

	// Reactor assigned: show tooltip with reactor name
	const reactorEntity = reactors.getElementById(reactor.id) as
		| { displayName: string }
		| undefined;

	return (
		<div className={classNames("relative", className)}>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger
						render={
							<button
								type="button"
								className={buttonClasses}
								onClick={() => setActiveReactorId(reactor.id)}
							/>
						}
					>
						<Flash className="w-3.5 h-3.5" />
					</TooltipTrigger>
					<TooltipContent
						side="left"
						sideOffset={6}
						className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
					>
						{reactorEntity?.displayName}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}

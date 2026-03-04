import { setActiveReactorId } from "@/app/actions/app";
import useReactors, { addReactor } from "@/app/actions/reactors";
import { loadScenes } from "@/app/actions/scenes";
import { Flash, Plus } from "@/app/icons";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
	const reactorList = useReactors((state) => state.reactors) as {
		id: string;
		displayName: string;
	}[];

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
				<DropdownMenuContent side="bottom" align="start" sideOffset={4} className="min-w-40">
					<DropdownMenuRadioGroup value={reactor?.id ?? ""}>
						{reactorList.map((r) => (
							<DropdownMenuRadioItem
								key={r.id}
								value={r.id}
								onClick={() => assignReactor(r.id)}
							>
								<Flash className="w-3.5 h-3.5 text-neutral-400" />
								{r.displayName}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
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

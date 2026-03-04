import type Display from "@/lib/core/Display";
import { setActiveReactorId } from "@/app/actions/app";
import { addReactor } from "@/app/actions/reactors";
import { loadScenes } from "@/app/actions/scenes";
import Icon from "@/app/components/interface/Icon";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { reactors } from "@/app/global";
import { Flash, Plus } from "@/app/icons";
import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";

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
	const [showPicker, setShowPicker] = useState(false);
	const pickerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!showPicker) return;

		function handleClickOutside(e: MouseEvent) {
			if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
				setShowPicker(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showPicker]);

	function assignReactor(reactorId: string) {
		display.setReactor(name, { id: reactorId, min, max });
		setActiveReactorId(reactorId);
		loadScenes();
		setShowPicker(false);
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
		} else if (reactors.length === 0) {
			createAndAssign();
		} else {
			setShowPicker(true);
		}
	}

	return (
		<div className="relative" ref={pickerRef}>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger
						render={
							<Icon
								className={classNames(
									"text-neutral-500 w-4 h-4 [&:hover]:text-neutral-100",
									className,
									{
										"text-neutral-100": reactor,
									},
								)}
								glyph={Flash}
								onClick={handleClick}
							/>
						}
					/>
					<TooltipContent
						side="bottom"
						sideOffset={6}
						className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
					>
						{reactor ? "Show Reactor" : "Enable Reactor"}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			{showPicker && (
				<div className="absolute left-0 top-full mt-1 z-50 min-w-40 rounded-md border border-neutral-700 bg-neutral-800 py-1 shadow-lg">
					{reactors.map((r: { id: string; displayName: string }) => (
						<Button
							key={r.id}
							variant="ghost"
							className="flex w-full justify-start gap-2 px-3 py-1.5 h-auto rounded-none text-neutral-200 hover:bg-primary"
							onClick={() => assignReactor(r.id)}
						>
							<Icon className="w-3.5 h-3.5 text-neutral-400" glyph={Flash} />
							{r.displayName}
						</Button>
					))}
					<div className="border-t border-neutral-700 my-1" />
					<Button
						variant="ghost"
						className="flex w-full justify-start gap-2 px-3 py-1.5 h-auto rounded-none text-neutral-200 hover:bg-primary"
						onClick={createAndAssign}
					>
						<Icon className="w-3.5 h-3.5 text-neutral-400" glyph={Plus} />
						New Reactor
					</Button>
				</div>
			)}
		</div>
	);
}

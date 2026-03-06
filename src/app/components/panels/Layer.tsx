import TextInput from "@/app/components/inputs/TextInput";
import { Eye, TrashEmpty } from "@/app/icons";
import classNames from "classnames";
import type { LucideIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface LayerProps {
	id: string;
	name?: string;
	icon?: LucideIcon | null;
	className?: string;
	active?: boolean;
	dragging?: boolean;
	dragOver?: boolean;
	enabled?: boolean;
	onLayerClick?: (id: string) => void;
	onLayerUpdate?: (id: string, prop: string, value: unknown) => void;
	onLayerDelete?: ((id: string) => void) | null;
	onLayerDragStart?: (id: string, e: React.DragEvent<HTMLDivElement>) => void;
	onLayerDragOver?: (id: string, e: React.DragEvent<HTMLDivElement>) => void;
	onLayerDrop?: (id: string, e: React.DragEvent<HTMLDivElement>) => void;
	onLayerDragEnd?: () => void;
}

export default function Layer({
	id,
	name = "",
	icon = null,
	className,
	active = false,
	dragging = false,
	dragOver = false,
	enabled = true,
	onLayerClick,
	onLayerUpdate,
	onLayerDelete = null,
	onLayerDragStart,
	onLayerDragOver,
	onLayerDrop,
	onLayerDragEnd,
}: LayerProps) {
	const [edit, setEdit] = useState(false);
	const LayerIcon = icon;

	function createDragPreview(source: HTMLDivElement) {
		if (typeof document === "undefined") {
			return null;
		}

		const preview = source.cloneNode(true) as HTMLDivElement;
		preview.style.position = "fixed";
		preview.style.top = "-1000px";
		preview.style.left = "-1000px";
		preview.style.width = `${source.offsetWidth}px`;
		preview.style.pointerEvents = "none";
		preview.style.zIndex = "9999";
		preview.style.opacity = "0.92";
		preview.style.transform = "rotate(1deg)";
		document.body.appendChild(preview);

		window.setTimeout(() => {
			preview.remove();
		}, 0);

		return preview;
	}

	function handleLayerClick() {
		onLayerClick?.(id);
	}

	function handleEnableClick() {
		onLayerUpdate?.(id, "enabled", !enabled);
	}

	function handleNameChange(name: string, val: string) {
		if (val.length > 0) {
			onLayerUpdate?.(id, name, val);
		}
		setEdit(false);
	}

	function handleEnableEdit(e: React.MouseEvent) {
		e.stopPropagation();
		setEdit(true);
	}

	function handleCancelEdit() {
		setEdit(false);
	}

	function handleDeleteClick(e: React.MouseEvent) {
		e.stopPropagation();
		if (onLayerDelete) {
			onLayerDelete(id);
		}
	}

	return (
		<div
			draggable={!edit}
			className={classNames(
				className,
				"group flex flex-row items-center text-sm text-neutral-300 hover:text-neutral-100 bg-neutral-800 px-2 py-1 relative cursor-default gap-2",
				{
					"bg-neutral-800": edit,
					"bg-primary": active && !edit,
					"opacity-25": dragging && !edit,
					"ring-1 ring-primary": dragOver && !edit,
				},
			)}
			onClick={handleLayerClick}
			onDragStart={(e) => {
				e.dataTransfer.effectAllowed = "move";
				e.dataTransfer.setData("text/plain", id);
				const preview = createDragPreview(e.currentTarget);
				if (preview) {
					e.dataTransfer.setDragImage(preview, 16, 12);
				}
				onLayerDragStart?.(id, e);
			}}
			onDragOver={(e) => onLayerDragOver?.(id, e)}
			onDrop={(e) => onLayerDrop?.(id, e)}
			onDragEnd={onLayerDragEnd}
		>
			{LayerIcon && <LayerIcon className={"w-4 h-4"} />}
			<div className={"flex-1 min-w-0 py-0.5"} onDoubleClick={handleEnableEdit}>
				{edit ? (
					<TextInput
						name="displayName"
						value={name}
						width={undefined as unknown as number}
						className={
							"h-7 !px-2 !leading-7 !rounded !bg-neutral-800 !border-primary"
						}
						buffered
						autoFocus
						autoSelect
						onChange={handleNameChange}
					/>
				) : (
					name
				)}
			</div>
			{onLayerDelete && (
				<TrashEmpty
					className="w-4 h-4 opacity-0 group-hover:opacity-50 group-hover:hover:opacity-100"
					onClick={handleDeleteClick}
				/>
			)}
			<Eye
				className={classNames("w-4 h-4", {
					"opacity-30": !enabled,
				})}
				onClick={(e) => {
					e.stopPropagation();
					handleEnableClick();
				}}
			/>
		</div>
	);
}

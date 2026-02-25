import TextInput from "@/lib/view/components/inputs/TextInput";
import Icon from "@/lib/view/components/interface/Icon";
import { Eye } from "@/lib/view/icons";
import classNames from "classnames";
import React, { useState } from "react";

export default function Layer({
	id,
	name = "",
	icon = null,
	className = null,
	active = false,
	enabled = true,
	onLayerClick = () => {},
	onLayerUpdate = () => {},
}) {
	const [edit, setEdit] = useState(false);

	function handleLayerClick() {
		onLayerClick(id);
	}

	function handleEnableClick() {
		onLayerUpdate(id, "enabled", !enabled);
	}

	function handleNameChange(name, val) {
		if (val.length > 0) {
			onLayerUpdate(id, name, val);
		}
		setEdit(false);
	}

	function handleEnableEdit(e) {
		e.stopPropagation();
		setEdit(true);
	}

	function handleCancelEdit() {
		setEdit(false);
	}

	return (
		<div
			className={classNames(
				"flex flex-row text-[var(--font-size-small)] text-text100 bg-gray200 border-b border-b-gray75 p-[5px] mx-[5px] relative cursor-default [&>*]:mr-2 [&>*:last-child]:mr-0 [&:after]:content-['\\00a0']",
				className,
				{
					"bg-gray100": edit,
					"bg-primary100": active,
				},
			)}
			onClick={handleLayerClick}
		>
			{icon && <Icon className={"w-3 h-3"} glyph={icon} />}
			<div className={"flex-1"} onDoubleClick={handleEnableEdit}>
				{edit ? (
					<TextInput
						name="displayName"
						value={name}
						buffered
						autoFocus
						autoSelect
						onChange={handleNameChange}
						onCancel={handleCancelEdit}
					/>
				) : (
					name
				)}
			</div>
			<Icon
				className={classNames("w-[13px] h-[13px]", {
					"opacity-30": !enabled,
				})}
				glyph={Eye}
				onClick={handleEnableClick}
			/>
		</div>
	);
}

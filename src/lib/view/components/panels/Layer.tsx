// @ts-nocheck
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
				"flex flex-row items-center text-sm text-text100 bg-gray200 border-b border-b-gray75 p-1 mx-1 relative cursor-default [&>*]:mr-2 [&>*:last-child]:mr-0 [&:after]:content-['\\00a0']",
				className,
				{
					"bg-gray100": edit,
					"bg-primary100": active && !edit,
				},
			)}
			onClick={handleLayerClick}
		>
			{icon && <Icon className={"w-3 h-3"} glyph={icon} />}
			<div className={"flex-1 min-w-0 py-0.5"} onDoubleClick={handleEnableEdit}>
				{edit ? (
					<TextInput
						name="displayName"
						value={name}
						width="100%"
						className={
							"h-7 !px-2 !leading-7 !rounded-md !bg-gray100 !border-primary100"
						}
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
				className={classNames("w-3.5 h-3.5", {
					"opacity-30": !enabled,
				})}
				glyph={Eye}
				onClick={handleEnableClick}
			/>
		</div>
	);
}

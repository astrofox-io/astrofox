import TextInput from "@/lib/view/components/inputs/TextInput";
import Icon from "@/lib/view/components/interface/Icon";
import { Eye } from "@/lib/view/icons";
import classNames from "classnames";
import React, { useState } from "react";
import styles from "./Layer.module.tailwind";

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
			className={classNames(styles.layer, className, {
				[styles.edit]: edit,
				[styles.active]: active,
			})}
			onClick={handleLayerClick}
		>
			{icon && <Icon className={styles.icon} glyph={icon} />}
			<div className={styles.text} onDoubleClick={handleEnableEdit}>
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
				className={classNames(styles.enableIcon, {
					[styles.disabled]: !enabled,
				})}
				glyph={Eye}
				onClick={handleEnableClick}
			/>
		</div>
	);
}

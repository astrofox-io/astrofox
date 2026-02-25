import { ignoreEvents } from "@/lib/utils/react";
import { raiseError } from "@/lib/view/actions/error";
import Icon from "@/lib/view/components/interface/Icon";
import { BLANK_IMAGE } from "@/lib/view/constants";
import { api } from "@/lib/view/global";
import { FolderOpen, Times } from "@/lib/view/icons";
import classNames from "classnames";
import React, { useRef } from "react";
import styles from "./ImageInput.module.tailwind";

export default function ImageInput({ name, value, onChange }) {
	const image = useRef();
	const hasImage = value !== BLANK_IMAGE;

	function handleImageLoad() {
		onChange(name, image.current?.src || BLANK_IMAGE);
	}

	function loadImageSrc(src) {
		if (image.current.src !== src) {
			image.current.src = src;
		}
	}

	async function loadImageFile(file) {
		try {
			const dataUrl = await api.readImageFile(file);

			return loadImageSrc(dataUrl);
		} catch (error) {
			raiseError("Invalid image file.", error);
		}
	}

	async function handleDrop(e) {
		e.preventDefault();

		await loadImageFile(e.dataTransfer.files[0]);
	}

	async function handleClick() {
		const { files, canceled } = await api.showOpenDialog({
			filters: [
				{ name: "Image files", extensions: ["jpg", "jpeg", "png", "gif"] },
			],
		});

		if (!canceled && files && files.length) {
			await loadImageFile(files[0]);
		}
	}

	function handleDelete() {
		loadImageSrc(BLANK_IMAGE);
	}

	return (
		<>
			<div
				className={styles.image}
				onDrop={handleDrop}
				onDragOver={ignoreEvents}
				onClick={handleClick}
			>
				<img
					ref={image}
					className={classNames(styles.img, {
						[styles.hidden]: !hasImage,
					})}
					src={value}
					alt=""
					onLoad={handleImageLoad}
				/>
				<Icon
					className={styles.openIcon}
					glyph={FolderOpen}
					title="Open File"
				/>
			</div>
			{hasImage && (
				<Icon
					className={classNames({
						[styles.closeIcon]: true,
					})}
					glyph={Times}
					title="Remove Image"
					onClick={handleDelete}
				/>
			)}
		</>
	);
}

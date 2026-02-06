import { raiseError } from "actions/error";
import classNames from "classnames";
import Icon from "components/interface/Icon";
import React, { useRef } from "react";
import { ignoreEvents } from "utils/react";
import { BLANK_IMAGE } from "view/constants";
import { api } from "view/global";
import { FolderOpen, Times } from "view/icons";
import styles from "./ImageInput.module.less";

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

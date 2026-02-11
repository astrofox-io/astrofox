import { raiseError } from "actions/error";
import classNames from "classnames";
import Icon from "components/interface/Icon";
import React, { useRef } from "react";
import { ignoreEvents } from "utils/react";
import { BLANK_IMAGE } from "view/constants";
import { api } from "view/global";
import { FolderOpen, Times } from "view/icons";
import styles from "./ImageInput.module.less";

export default function VideoInput({ name, value, onChange }) {
	const video = useRef();
	const hasVideo = value !== BLANK_IMAGE;

	function handleVideoLoad() {
		onChange(name, video.current?.src || BLANK_IMAGE);
	}

	function loadVideoSrc(src) {
		if (video.current.src !== src) {
			video.current.src = src;
		}
	}

	async function loadVideoFile(file) {
		try {
			const dataUrl = await api.readVideoFile(file);

			return loadVideoSrc(dataUrl);
		} catch (error) {
			raiseError("Invalid video file.", error);
		}
	}

	async function handleDrop(e) {
		e.preventDefault();

		await loadVideoFile(e.dataTransfer.files[0]);
	}

	async function handleClick() {
		const { files, canceled } = await api.showOpenDialog({
			filters: [{ name: "Video files", extensions: ["mp4", "webm", "ogv"] }],
		});

		if (!canceled && files && files.length) {
			await loadVideoFile(files[0]);
		}
	}

	function handleDelete() {
		loadVideoSrc("");
		onChange(name, BLANK_IMAGE);
	}

	return (
		<>
			<div
				className={styles.image}
				onDrop={handleDrop}
				onDragOver={ignoreEvents}
				onClick={handleClick}
			>
				<video
					ref={video}
					className={classNames(styles.img, {
						[styles.hidden]: !hasVideo,
					})}
					src={hasVideo ? value : ""}
					muted
					loop
					autoPlay
					onLoadedData={handleVideoLoad}
				/>
				<Icon
					className={styles.openIcon}
					glyph={FolderOpen}
					title="Open File"
				/>
			</div>
			{hasVideo && (
				<Icon
					className={classNames({
						[styles.closeIcon]: true,
					})}
					glyph={Times}
					title="Remove Video"
					onClick={handleDelete}
				/>
			)}
		</>
	);
}

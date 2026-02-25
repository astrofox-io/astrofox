import { ignoreEvents } from "@/lib/utils/react";
import { raiseError } from "@/lib/view/actions/error";
import Icon from "@/lib/view/components/interface/Icon";
import { BLANK_IMAGE } from "@/lib/view/constants";
import { api } from "@/lib/view/global";
import { FolderOpen, Times } from "@/lib/view/icons";
import classNames from "classnames";
import React, { useRef } from "react";

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
				className={"h-[100px] w-[100px] bg-[var(--input-bg-color)] border border-[var(--input-border-color)] rounded-[var(--input-border-radius)] relative overflow-hidden [&:hover_.open-icon]:opacity-[1] [&:hover_.open-icon]:scale-100"}
				onDrop={handleDrop}
				onDragOver={ignoreEvents}
				onClick={handleClick}
			>
				<video
					ref={video}
					className={classNames("absolute top-1/2 -translate-y-1/2 w-full h-[auto]", {
						hidden: !hasVideo,
					})}
					src={hasVideo ? value : ""}
					muted
					loop
					autoPlay
					onLoadedData={handleVideoLoad}
				/>
				<Icon
					className={"absolute top-0 left-0 right-0 bottom-0 m-auto scale-50 text-[var(--text100)] h-6 w-6 opacity-[0] transition-[all_0.25s] [filter:drop-shadow(1px_1px_1px_#000)]"}
					glyph={FolderOpen}
					title="Open File"
				/>
			</div>
			{hasVideo && (
				<Icon
					className={classNames({
						["text-[var(--text200)] w-3.5 h-3.5 [&:hover]:text-[var(--text100)]"]: true,
					})}
					glyph={Times}
					title="Remove Video"
					onClick={handleDelete}
				/>
			)}
		</>
	);
}

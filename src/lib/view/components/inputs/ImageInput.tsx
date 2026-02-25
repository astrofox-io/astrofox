// @ts-nocheck
import { ignoreEvents } from "@/lib/utils/react";
import { raiseError } from "@/lib/view/actions/error";
import Icon from "@/lib/view/components/interface/Icon";
import { BLANK_IMAGE } from "@/lib/view/constants";
import { api } from "@/lib/view/global";
import { FolderOpen, Times } from "@/lib/view/icons";
import classNames from "classnames";
import React, { useRef } from "react";

export default function ImageInput({ name, value, onChange }: any) {
	const image = useRef<any>(null);
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
				className={"h-24 w-24 bg-input-bg border border-input-border rounded-input relative overflow-hidden [&:hover_.open-icon]:opacity-[1] [&:hover_.open-icon]:scale-100"}
				onDrop={handleDrop}
				onDragOver={ignoreEvents}
				onClick={handleClick}
			>
				<img
					ref={image}
					className={classNames("absolute top-1/2 -translate-y-1/2 w-full h-auto", {
						hidden: !hasImage,
					})}
					src={value}
					alt=""
					onLoad={handleImageLoad}
				/>
				<Icon
					className={"absolute top-0 left-0 right-0 bottom-0 m-auto scale-50 text-text100 h-6 w-6 opacity-[0] transition-[all_0.25s] [filter:drop-shadow(1px_1px_1px_#000)]"}
					glyph={FolderOpen}
					title="Open File"
				/>
			</div>
			{hasImage && (
				<Icon
					className={classNames({
						["text-text200 w-3.5 h-3.5 [&:hover]:text-text100"]: true,
					})}
					glyph={Times}
					title="Remove Image"
					onClick={handleDelete}
				/>
			)}
		</>
	);
}

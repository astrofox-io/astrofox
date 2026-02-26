// @ts-nocheck
import { ignoreEvents } from "@/lib/utils/react";
import { raiseError } from "@/lib/view/actions/error";
import Icon from "@/lib/view/components/interface/Icon";
import { BLANK_IMAGE } from "@/lib/view/constants";
import { api } from "@/lib/view/global";
import { FolderOpen, Times } from "@/lib/view/icons";
import classNames from "classnames";
import React, { useRef } from "react";

function isFileUrlSource(src) {
	return /^file:\/\//i.test(src || "");
}

function isWindowsPathSource(src) {
	return /^[a-zA-Z]:[\\/]/.test(src || "");
}

function isUncPathSource(src) {
	return /^\\\\/.test(src || "");
}

function toFileUrl(path) {
	if (!path || typeof path !== "string") {
		return "";
	}

	const sourcePath = path.trim();

	if (!sourcePath) {
		return "";
	}

	if (isFileUrlSource(sourcePath)) {
		return sourcePath;
	}

	const escaped = encodeURI(sourcePath)
		.replace(/#/g, "%23")
		.replace(/\?/g, "%3F");

	if (isWindowsPathSource(sourcePath)) {
		return `file:///${escaped.replace(/\\/g, "/")}`;
	}

	if (isUncPathSource(sourcePath)) {
		const unc = escaped.replace(/^\\\\/, "").replace(/\\/g, "/");
		return `file://${unc}`;
	}

	if (sourcePath.startsWith("/")) {
		return `file://${escaped}`;
	}

	return sourcePath;
}

function getFilePath(file) {
	if (!file || typeof file !== "object") {
		return "";
	}

	if (typeof file.path === "string" && file.path.trim()) {
		return file.path.trim();
	}

	if (typeof file.filePath === "string" && file.filePath.trim()) {
		return file.filePath.trim();
	}

	if (typeof file.fullPath === "string" && file.fullPath.trim()) {
		return file.fullPath.trim();
	}

	return "";
}

export default function ImageInput({ name, value, onChange }: any) {
	const image = useRef<any>(null);
	const hasImage = value !== BLANK_IMAGE;

	function loadImageSrc(src) {
		if (image.current.src !== src) {
			image.current.src = src;
		}
	}

	async function loadImageFile(file) {
		try {
			const sourcePath = getFilePath(file);
			const src = sourcePath
				? toFileUrl(sourcePath)
				: await api.readImageFile(file);

			loadImageSrc(src);
			onChange({
				[name]: src,
				sourcePath: sourcePath || "",
			});
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
		onChange({
			[name]: BLANK_IMAGE,
			sourcePath: "",
		});
	}

	return (
		<>
			<div
				className={
					"h-24 w-24 bg-input-bg border border-input-border rounded-input relative overflow-hidden [&:hover_.open-icon]:opacity-[1] [&:hover_.open-icon]:scale-100"
				}
				onDrop={handleDrop}
				onDragOver={ignoreEvents}
				onClick={handleClick}
			>
				<img
					ref={image}
					className={classNames(
						"absolute top-1/2 -translate-y-1/2 w-full h-auto",
						{
							hidden: !hasImage,
						},
					)}
					src={value}
					alt=""
				/>
				<Icon
					className={
						"absolute top-0 left-0 right-0 bottom-0 m-auto scale-50 text-text100 h-4 w-4 opacity-[0] transition-[all_0.25s] [filter:drop-shadow(1px_1px_1px_#000)]"
					}
					glyph={FolderOpen}
					title="Open File"
				/>
			</div>
			{hasImage && (
				<Icon
					className={classNames({
						["text-text200 w-4 h-4 [&:hover]:text-text100"]: true,
					})}
					glyph={Times}
					title="Remove Image"
					onClick={handleDelete}
				/>
			)}
		</>
	);
}

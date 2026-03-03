import { ignoreEvents } from "@/lib/utils/react";
import { raiseError } from "@/lib/view/actions/error";
import Icon from "@/lib/view/components/interface/Icon";
import Tooltip from "@/lib/view/components/interface/Tooltip";
import { BLANK_IMAGE } from "@/lib/view/constants";
import { api } from "@/lib/view/global";
import { FolderOpen, Times } from "@/lib/view/icons";
import classNames from "classnames";
import React, { useRef } from "react";

function isFileUrlSource(src: string) {
	return /^file:\/\//i.test(src || "");
}

function isWindowsPathSource(src: string) {
	return /^[a-zA-Z]:[\\/]/.test(src || "");
}

function isUncPathSource(src: string) {
	return /^\\\\/.test(src || "");
}

function toFileUrl(path: string) {
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

interface FileWithPath {
	path?: string;
	filePath?: string;
	fullPath?: string;
}

function getFilePath(file: FileWithPath | null) {
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

interface ImageInputProps {
	name: string;
	value?: string;
	onChange?: (props: Record<string, unknown>) => void;
}

export default function ImageInput({ name, value, onChange }: ImageInputProps) {
	const image = useRef<HTMLImageElement>(null);
	const hasImage = value !== BLANK_IMAGE;

	function loadImageSrc(src: string | ArrayBuffer | null) {
		if (image.current && image.current.src !== src) {
			image.current.src = String(src);
		}
	}

	async function loadImageFile(file: File) {
		try {
			const sourcePath = getFilePath(file as unknown as FileWithPath);
			const src = sourcePath
				? toFileUrl(sourcePath)
				: await api.readImageFile(file);

			loadImageSrc(src);
			onChange?.({
				[name]: src,
				sourcePath: sourcePath || "",
			});
		} catch (error) {
			raiseError("Invalid image file.", error);
		}
	}

	async function handleDrop(e: React.DragEvent) {
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
		onChange?.({
			[name]: BLANK_IMAGE,
			sourcePath: "",
		});
	}

	return (
		<>
			<div
				className={
					"h-24 w-24 bg-neutral-900 border border-neutral-600 rounded-md relative overflow-hidden [&:hover_.open-icon]:opacity-[1] [&:hover_.open-icon]:scale-100"
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
				<Tooltip text="Open File">
				<Icon
					className={
						"absolute top-0 left-0 right-0 bottom-0 m-auto scale-50 text-neutral-100 h-4 w-4 opacity-[0] transition-[all_0.25s] [filter:drop-shadow(1px_1px_1px_#000)]"
					}
					glyph={FolderOpen}
				/>
			</Tooltip>
			</div>
			{hasImage && (
				<Tooltip text="Remove Image">
				<Icon
					className={classNames({
						["text-neutral-300 w-4 h-4 [&:hover]:text-neutral-100"]: true,
					})}
					glyph={Times}
					onClick={handleDelete}
				/>
			</Tooltip>
			)}
		</>
	);
}

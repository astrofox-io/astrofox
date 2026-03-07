// @ts-nocheck
import { BLANK_IMAGE } from "@/app/constants";
import React from "react";
import { LinearFilter, SRGBColorSpace, VideoTexture } from "three";
import { TexturePlane } from "./TexturePlane";

export function VideoDisplayLayer({
	display,
	order,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
}) {
	const { properties = {} } = display;
	const {
		src,
		x = 0,
		y = 0,
		rotation = 0,
		zoom = 1,
		opacity = 1,
		width = 0,
		height = 0,
		loop = true,
		startTime = 0,
		endTime = 0,
	} = properties;

	const video = React.useMemo(() => {
		const element = document.createElement("video");
		element.muted = true;
		element.playsInline = true;
		element.preload = "auto";
		element.crossOrigin = "anonymous";

		return element;
	}, []);

	const texture = React.useMemo(() => {
		const nextTexture = new VideoTexture(video);
		nextTexture.minFilter = LinearFilter;
		nextTexture.magFilter = LinearFilter;
		nextTexture.colorSpace = SRGBColorSpace;
		nextTexture.generateMipmaps = false;
		nextTexture.needsUpdate = true;
		return nextTexture;
	}, [video]);

	React.useEffect(() => {
		if (!src || src === BLANK_IMAGE) {
			video.pause();
			video.removeAttribute("src");
			video.load();
			return;
		}

		video.loop = Boolean(loop && !endTime);
		video.src = src;

		const onTimeUpdate = () => {
			if (loop && endTime > 0 && video.currentTime >= endTime) {
				video.currentTime = Math.max(0, startTime || 0);
			}
		};

		const onLoadedMetadata = () => {
			video.currentTime = Math.max(0, startTime || 0);
			const playback = video.play();
			if (playback?.catch) {
				playback.catch(() => {});
			}
		};

		video.addEventListener("timeupdate", onTimeUpdate);
		video.addEventListener("loadedmetadata", onLoadedMetadata);

		if (video.readyState >= 1) {
			onLoadedMetadata();
		}

		return () => {
			video.pause();
			video.removeEventListener("timeupdate", onTimeUpdate);
			video.removeEventListener("loadedmetadata", onLoadedMetadata);
		};
	}, [video, src, loop, startTime, endTime]);

	React.useEffect(() => {
		return () => {
			texture.dispose();
			video.pause();
			video.removeAttribute("src");
			video.load();
		};
	}, [texture, video]);

	if (!src || src === BLANK_IMAGE) {
		return null;
	}

	const videoWidth = video.videoWidth || width || 1;
	const videoHeight = video.videoHeight || height || 1;
	const planeWidth = width || videoWidth;
	const planeHeight = height || videoHeight;

	return (
		<TexturePlane
			texture={texture}
			width={planeWidth}
			height={planeHeight}
			x={x}
			y={y}
			originX={planeWidth / 2}
			originY={planeHeight / 2}
			rotation={rotation}
			zoom={zoom}
			opacity={opacity}
			sceneOpacity={sceneOpacity}
			sceneBlendMode={sceneBlendMode}
			sceneMask={sceneMask}
			sceneInverse={sceneInverse}
			sceneMaskCombine={sceneMaskCombine}
			renderOrder={order}
		/>
	);
}

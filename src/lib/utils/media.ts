interface MediaBounds {
	width: number;
	height: number;
}

export function fitMediaWithinBounds(
	mediaWidth: number,
	mediaHeight: number,
	boundsWidth: number,
	boundsHeight: number,
): MediaBounds {
	if (!mediaWidth || !mediaHeight) {
		return {
			width: 0,
			height: 0,
		};
	}

	if (!boundsWidth || !boundsHeight) {
		return {
			width: mediaWidth,
			height: mediaHeight,
		};
	}

	const scale = Math.min(boundsWidth / mediaWidth, boundsHeight / mediaHeight);

	return {
		width: Math.round(mediaWidth * scale),
		height: Math.round(mediaHeight * scale),
	};
}

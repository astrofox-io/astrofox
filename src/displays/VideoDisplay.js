import CanvasDisplay from "core/CanvasDisplay";
import { isDefined } from "utils/array";
import { BLANK_IMAGE } from "view/constants";

const disabled = (display) => !display.hasVideo;
const maxWidth = (display) => {
	const { width } = display.scene.getSize();
	const videoWidth = display.video?.videoWidth || 0;

	return videoWidth > width ? videoWidth : width;
};
const maxHeight = (display) => {
	const { height } = display.scene.getSize();
	const videoHeight = display.video?.videoHeight || 0;

	return videoHeight > height ? videoHeight : height;
};
const maxX = (display) => (disabled(display) ? 0 : maxWidth(display));
const maxY = (display) => (disabled(display) ? 0 : maxHeight(display));

export default class VideoDisplay extends CanvasDisplay {
	static config = {
		name: "VideoDisplay",
		description: "Displays a video.",
		type: "display",
		label: "Video",
		defaultProperties: {
			src: BLANK_IMAGE,
			x: 0,
			y: 0,
			zoom: 1,
			width: 0,
			height: 0,
			fixed: true,
			rotation: 0,
			opacity: 0,
			loop: true,
			startTime: 0,
			endTime: 0,
		},
		controls: {
			src: {
				label: "Video",
				type: "video",
			},
			width: {
				label: "Width",
				type: "number",
				min: 0,
				max: maxWidth,
				withRange: true,
				withLink: "fixed",
				disabled,
			},
			height: {
				label: "Height",
				type: "number",
				min: 0,
				max: maxHeight,
				withRange: true,
				withLink: "fixed",
				disabled,
			},
			x: {
				label: "X",
				type: "number",
				min: (display) => -1 * maxX(display),
				max: (display) => maxX(display),
				withRange: true,
				disabled,
			},
			y: {
				label: "Y",
				type: "number",
				min: (display) => -1 * maxY(display),
				max: (display) => maxY(display),
				withRange: true,
				disabled,
			},
			rotation: {
				label: "Rotation",
				type: "number",
				min: 0,
				max: 360,
				withRange: true,
				withReactor: true,
				disabled,
			},
			opacity: {
				label: "Opacity",
				type: "number",
				min: 0,
				max: 1.0,
				step: 0.01,
				withRange: true,
				withReactor: true,
				disabled,
			},
			loop: {
				label: "Loop",
				type: "toggle",
				disabled,
			},
			startTime: {
				label: "Start Time",
				type: "number",
				min: 0,
				max: 600,
				step: 0.1,
				withRange: true,
				disabled,
			},
			endTime: {
				label: "End Time",
				type: "number",
				min: 0,
				max: 600,
				step: 0.1,
				withRange: true,
				disabled,
			},
		},
	};

	constructor(properties) {
		super(VideoDisplay, properties);

		this.video = document.createElement("video");
		this.video.muted = true;
		this.video.playsInline = true;
		this.video.preload = "auto";
		this.video.crossOrigin = "anonymous";
		this.video.addEventListener("timeupdate", this.handleTimeUpdate);

		if (this.properties.src !== BLANK_IMAGE) {
			this.video.src = this.properties.src;
		}
	}

	get hasVideo() {
		return this.properties.src !== BLANK_IMAGE;
	}

	handleTimeUpdate = () => {
		const { loop, startTime, endTime } = this.properties;

		if (loop && endTime > 0 && this.video.currentTime >= endTime) {
			this.video.currentTime = Math.max(0, startTime || 0);
		}
	};

	playVideo() {
		const playback = this.video.play();
		if (playback?.catch) {
			playback.catch(() => {});
		}
	}

	setCanvasSize(width, height) {
		this.canvas.width = Math.max(0, Math.round(width || 0));
		this.canvas.height = Math.max(0, Math.round(height || 0));
	}

	update(properties) {
		const { src: inputSrc, loop, startTime, endTime, fixed, width, height } =
			properties;
		const { src, width: w, height: h, fixed: f } = this.properties;
		const srcChanged = typeof inputSrc === "string" && inputSrc !== src;

		if (!srcChanged && (fixed || f) && isDefined(width, height, fixed)) {
			const videoWidth = this.video.videoWidth;
			const videoHeight = this.video.videoHeight;
			if (!videoWidth || !videoHeight) {
				return false;
			}

			const ratio = videoWidth / videoHeight;

			if (!isDefined(width, height)) {
				if (w > h) {
					properties.height = Math.round(w * (1 / ratio)) || 0;
					properties.width = Math.round(properties.height * ratio);
				} else {
					properties.width = Math.round(h * ratio);
					properties.height = Math.round(properties.width * (1 / ratio)) || 0;
				}
			}

			if (width) {
				properties.height = Math.round(width * (1 / ratio)) || 0;
			}
			if (height) {
				properties.width = Math.round(height * ratio);
			}
		}

		const nextSrcChanged =
			typeof properties.src === "string" && properties.src !== src;
		const changed = super.update(properties);

		if (changed) {
			if (loop !== undefined || endTime !== undefined) {
				this.video.loop = Boolean(this.properties.loop && !this.properties.endTime);
			}

			if (nextSrcChanged) {
				if (this.properties.src === BLANK_IMAGE) {
					this.video.pause();
					this.video.removeAttribute("src");
					this.video.load();
					this.setCanvasSize(0, 0);
				} else {
					this.video.src = this.properties.src;
					this.video.loop = Boolean(this.properties.loop && !this.properties.endTime);
					this.playVideo();

					const onLoadedMetadata = () => {
						this.video.currentTime = Math.max(0, this.properties.startTime || 0);

						const nextProps = {};
						if (!this.properties.width && !this.properties.height) {
							nextProps.width = this.video.videoWidth;
							nextProps.height = this.video.videoHeight;
						}
						if (this.properties.opacity === 0) {
							nextProps.opacity = 1;
						}

						if (Object.keys(nextProps).length > 0) {
							super.update(nextProps);
						}

						this.setCanvasSize(this.properties.width, this.properties.height);
					};

					if (this.video.readyState >= 1) {
						onLoadedMetadata();
					} else {
						this.video.addEventListener("loadedmetadata", onLoadedMetadata, {
							once: true,
						});
					}
				}
			} else {
				if (startTime !== undefined && this.video.readyState >= 1) {
					this.video.currentTime = Math.max(0, this.properties.startTime || 0);
				}
				if (isDefined(width, height)) {
					this.setCanvasSize(this.properties.width, this.properties.height);
				}
			}
		}

		return changed;
	}

	render(scene) {
		if (!this.hasVideo) {
			return;
		}

		const { width, height } = this.canvas;
		if (!width || !height || this.video.readyState < 2) {
			return;
		}

		this.context.clearRect(0, 0, width, height);
		this.context.drawImage(this.video, 0, 0, width, height);

		super.render(scene);
	}

	removeFromScene() {
		this.video.pause();
		this.video.removeAttribute("src");
		this.video.load();
		this.video.removeEventListener("timeupdate", this.handleTimeUpdate);
	}
}

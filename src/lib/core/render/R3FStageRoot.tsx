// @ts-nocheck
import FFTParser from "@/lib/audio/FFTParser";
import WaveParser from "@/lib/audio/WaveParser";
import CanvasBars from "@/lib/canvas/CanvasBars";
import CanvasText from "@/lib/canvas/CanvasText";
import CanvasWave from "@/lib/canvas/CanvasWave";
import POINT_SPRITE from "@/lib/view/assets/images/point.png";
import { BLANK_IMAGE } from "@/lib/view/constants";
import React from "react";
import {
	CanvasTexture,
	DoubleSide,
	FrontSide,
	TextureLoader,
	VideoTexture,
} from "three";

const TRIANGLE_ANGLE = (2 * Math.PI) / 3;
const HEXAGON_ANGLE = (2 * Math.PI) / 6;
const WAVELENGTH_MAX = 0.25;

function toRadians(value = 0) {
	return (Number(value) * Math.PI) / 180;
}

function StageCamera({ width, height }) {
	return React.createElement("orthographicCamera", {
		makeDefault: true,
		args: [-width / 2, width / 2, height / 2, -height / 2, -1000, 1000],
		position: [0, 0, 10],
	});
}

function FallbackLayer({ width, height, texture }) {
	if (!texture || width <= 0 || height <= 0) {
		return null;
	}

	return React.createElement(
		"mesh",
		{
			renderOrder: 0,
		},
		React.createElement("planeGeometry", {
			args: [width, height],
		}),
		React.createElement("meshBasicMaterial", {
			map: texture,
			transparent: true,
			toneMapped: false,
			depthTest: false,
			depthWrite: false,
		}),
	);
}

function TexturePlane({
	texture,
	width,
	height,
	x,
	y,
	originX,
	originY,
	rotation,
	zoom,
	opacity,
	renderOrder,
}) {
	const position = [x + (width / 2 - originX), -y + (height / 2 - originY), 0];

	return React.createElement(
		"mesh",
		{
			position,
			rotation: [0, 0, -toRadians(rotation)],
			scale: [zoom, zoom, 1],
			renderOrder,
		},
		React.createElement("planeGeometry", {
			args: [Math.max(1, width), Math.max(1, height)],
		}),
		React.createElement("meshBasicMaterial", {
			map: texture,
			transparent: true,
			opacity,
			toneMapped: false,
			depthTest: false,
			depthWrite: false,
		}),
	);
}

function ImageDisplayLayer({ display, order }) {
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
	} = properties;

	const texture = React.useMemo(() => {
		const nextTexture = new TextureLoader().load(src);
		nextTexture.needsUpdate = true;

		return nextTexture;
	}, [src]);

	React.useEffect(() => {
		return () => {
			if (texture?.dispose) {
				texture.dispose();
			}
		};
	}, [texture]);

	const image = texture?.image;
	const naturalWidth =
		image?.naturalWidth || image?.videoWidth || image?.width || 1;
	const naturalHeight =
		image?.naturalHeight || image?.videoHeight || image?.height || 1;
	const planeWidth = width || naturalWidth;
	const planeHeight = height || naturalHeight;

	return React.createElement(TexturePlane, {
		texture,
		width: planeWidth,
		height: planeHeight,
		x,
		y,
		originX: planeWidth / 2,
		originY: planeHeight / 2,
		rotation,
		zoom,
		opacity,
		renderOrder: order,
	});
}

function VideoDisplayLayer({ display, order }) {
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

	return React.createElement(TexturePlane, {
		texture,
		width: planeWidth,
		height: planeHeight,
		x,
		y,
		originX: planeWidth / 2,
		originY: planeHeight / 2,
		rotation,
		zoom,
		opacity,
		renderOrder: order,
	});
}

function drawShape(ctx, props, width, height) {
	const {
		shape = "Circle",
		fill = true,
		color = "#FFFFFF",
		stroke = false,
		strokeColor = "#FFFFFF",
		strokeWidth = 0,
	} = props;

	const w = width + strokeWidth * 2;
	const h = height + strokeWidth * 2;
	const cx = w / 2;
	const cy = h / 2;
	const radius = w > 0 ? w / 2 : 1;

	ctx.clearRect(0, 0, w, h);
	ctx.fillStyle = color;
	ctx.strokeStyle = strokeColor;
	ctx.lineWidth = strokeWidth;

	if (shape === "Circle") {
		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
	} else if (shape === "Triangle") {
		const points = [];

		for (let i = 0; i < 3; i += 1) {
			points.push({
				x: cx + radius * Math.cos(i * TRIANGLE_ANGLE - toRadians(210)),
				y: cy + radius * Math.sin(i * TRIANGLE_ANGLE - toRadians(210)),
			});
		}

		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		for (let i = 1; i < points.length; i += 1) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		ctx.closePath();
	} else if (shape === "Hexagon") {
		const points = [];

		for (let i = 0; i < 6; i += 1) {
			points.push({
				x: cx + radius * Math.cos(i * HEXAGON_ANGLE),
				y: cy + radius * Math.sin(i * HEXAGON_ANGLE),
			});
		}

		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		for (let i = 1; i < points.length; i += 1) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		ctx.closePath();
	} else {
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(w, 0);
		ctx.lineTo(w, h);
		ctx.lineTo(0, h);
		ctx.closePath();
	}

	if (fill) {
		ctx.fill();
	}

	if (stroke && strokeWidth > 0) {
		ctx.save();
		ctx.clip();
		ctx.stroke();
		ctx.restore();
	}
}

function getWaveSpectrumPoints(fft, width) {
	const points = [];

	for (let i = 0, j = 0, k = 0; i < fft.length; i += 1) {
		j = fft[i];

		if (i === 0 || i === fft.length - 1 || k !== (j > fft[i - 1] ? 1 : -1)) {
			points.push(i * (width / fft.length));
			points.push(j);
		}

		k = j > fft[i - 1] ? 1 : -1;
	}

	if (points.length >= 2) {
		points[points.length - 2] = width;
	}

	return points;
}

function getSoundWavePoints(values, width) {
	const step = width / (values.length - 1);

	return Array.from(values).flatMap((n, i) => [i * step, n]);
}

function CanvasTextureLayer({ display, order, frameData, drawFrame }) {
	const { properties = {} } = display;
	const { x = 0, y = 0, rotation = 0, zoom = 1, opacity = 1 } = properties;

	const canvas = React.useMemo(() => document.createElement("canvas"), []);
	const texture = React.useMemo(() => new CanvasTexture(canvas), [canvas]);
	const originRef = React.useRef({ x: 0.5, y: 0.5 });

	React.useEffect(() => {
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return;
		}

		const firstPass = drawFrame({
			context: ctx,
			canvas,
			properties,
			frameData,
		});

		if (!firstPass) {
			return;
		}

		const width = Math.max(1, Math.round(firstPass.width || canvas.width || 1));
		const height = Math.max(
			1,
			Math.round(firstPass.height || canvas.height || 1),
		);

		if (canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;

			const nextContext = canvas.getContext("2d");
			if (nextContext) {
				drawFrame({
					context: nextContext,
					canvas,
					properties,
					frameData,
				});
			}
		}

		originRef.current = {
			x:
				firstPass.originX !== undefined
					? firstPass.originX
					: Math.round(width / 2),
			y:
				firstPass.originY !== undefined
					? firstPass.originY
					: Math.round(height / 2),
		};

		texture.needsUpdate = true;
	});

	React.useEffect(() => {
		return () => {
			texture.dispose();
		};
	}, [texture]);

	const width = Math.max(1, canvas.width || 1);
	const height = Math.max(1, canvas.height || 1);

	return React.createElement(TexturePlane, {
		texture,
		width,
		height,
		x,
		y,
		originX: originRef.current.x,
		originY: originRef.current.y,
		rotation,
		zoom,
		opacity,
		renderOrder: order,
	});
}

function TextDisplayLayer({ display, order, frameData, frameIndex }) {
	const textRef = React.useRef(null);

	const drawFrame = React.useCallback(({ context, properties }) => {
		if (!textRef.current) {
			textRef.current = new CanvasText(properties, context.canvas);
		}

		if (textRef.current.update(properties)) {
			textRef.current.render();
		} else if (!textRef.current._r3fHasRendered) {
			textRef.current.render();
			textRef.current._r3fHasRendered = true;
		}

		const width = Math.max(1, context.canvas.width || 1);
		const height = Math.max(1, context.canvas.height || 1);

		return {
			width,
			height,
			originX: width / 2,
			originY: height / 2,
		};
	}, []);

	React.useEffect(() => {
		return () => {
			textRef.current = null;
		};
	}, []);

	return React.createElement(CanvasTextureLayer, {
		display,
		order,
		frameData,
		drawFrame,
	});
}

function ShapeDisplayLayer({ display, order, frameData, frameIndex }) {
	const drawFrame = React.useCallback(({ context, properties }) => {
		const width = Math.max(
			1,
			Math.round(properties.width || properties.size || 100),
		);
		const height = Math.max(
			1,
			Math.round(
				properties.shape === "Rectangle"
					? properties.height || properties.width || 100
					: properties.width || properties.size || 100,
			),
		);

		const strokeWidth = Math.max(0, Math.round(properties.strokeWidth || 0));
		const canvasWidth = width + strokeWidth * 2;
		const canvasHeight = height + strokeWidth * 2;

		if (
			context.canvas.width !== canvasWidth ||
			context.canvas.height !== canvasHeight
		) {
			context.canvas.width = canvasWidth;
			context.canvas.height = canvasHeight;
		}

		drawShape(context, properties, width, height);

		return {
			width: canvasWidth,
			height: canvasHeight,
			originX: canvasWidth / 2,
			originY: canvasHeight / 2,
		};
	}, []);

	return React.createElement(CanvasTextureLayer, {
		display,
		order,
		frameData,
		drawFrame,
	});
}

function BarSpectrumDisplayLayer({ display, order, frameData, frameIndex }) {
	const barsRef = React.useRef(null);
	const parserRef = React.useRef(null);

	const drawFrame = React.useCallback(({ canvas, properties, frameData }) => {
		if (!barsRef.current) {
			barsRef.current = new CanvasBars(properties, canvas);
		}

		if (!parserRef.current) {
			parserRef.current = new FFTParser(properties);
		}

		barsRef.current.update(properties);
		parserRef.current.update(properties);

		const bins = Math.max(1, parserRef.current.totalBins || 64);
		const fftValues = frameData?.fft
			? parserRef.current.parseFFT(frameData.fft)
			: new Float32Array(bins);

		barsRef.current.render(fftValues);

		return {
			width: canvas.width,
			height: canvas.height,
			originX: canvas.width / 2,
			originY: Number(properties.height || 0),
		};
	}, []);

	return React.createElement(CanvasTextureLayer, {
		display,
		order,
		frameData,
		drawFrame,
	});
}

function WaveSpectrumDisplayLayer({ display, order, frameData, frameIndex }) {
	const waveRef = React.useRef(null);
	const parserRef = React.useRef(null);

	const drawFrame = React.useCallback(({ canvas, properties, frameData }) => {
		if (!waveRef.current) {
			waveRef.current = new CanvasWave(properties, canvas);
		}

		if (!parserRef.current) {
			parserRef.current = new FFTParser(properties);
		}

		waveRef.current.update(properties);
		parserRef.current.update(properties);

		const bins = Math.max(1, parserRef.current.totalBins || 64);
		const fftValues = frameData?.fft
			? parserRef.current.parseFFT(frameData.fft)
			: new Float32Array(bins);

		const width = Math.max(1, Number(properties.width || canvas.width || 1));
		const points = getWaveSpectrumPoints(fftValues, width);

		waveRef.current.render(points, true);

		return {
			width: canvas.width,
			height: canvas.height,
			originX: canvas.width / 2,
			originY: Number(properties.height || canvas.height),
		};
	}, []);

	return React.createElement(CanvasTextureLayer, {
		display,
		order,
		frameData,
		drawFrame,
	});
}

function SoundWaveDisplayLayer({ display, order, frameData, frameIndex }) {
	const waveRef = React.useRef(null);
	const parserRef = React.useRef(null);

	const drawFrame = React.useCallback(({ canvas, properties, frameData }) => {
		if (!waveRef.current) {
			waveRef.current = new CanvasWave(properties, canvas);
		}

		if (!parserRef.current) {
			parserRef.current = new WaveParser(properties);
		}

		waveRef.current.update(properties);
		parserRef.current.update(properties);

		const width = Math.max(2, Number(properties.width || canvas.width || 2));
		const wavelength = Number(properties.wavelength || 0);
		const sampleSize =
			wavelength > 0
				? Math.max(2, ~~(width / (wavelength * WAVELENGTH_MAX * width)))
				: width;

		const values = frameData?.td
			? parserRef.current.parseTimeData(frameData.td, sampleSize)
			: new Float32Array(sampleSize);

		const points = getSoundWavePoints(values, width);
		const smooth = wavelength > 0.02;

		waveRef.current.render(points, smooth);

		return {
			width: canvas.width,
			height: canvas.height,
			originX: canvas.width / 2,
			originY: canvas.height / 2,
		};
	}, []);

	return React.createElement(CanvasTextureLayer, {
		display,
		order,
		frameData,
		drawFrame,
	});
}

function getGeometrySpec(shape) {
	switch (shape) {
		case "Sphere":
			return { type: "sphereGeometry", args: [40, 10, 10] };
		case "Dodecahedron":
			return { type: "dodecahedronGeometry", args: [40, 0] };
		case "Icosahedron":
			return { type: "icosahedronGeometry", args: [40, 0] };
		case "Octahedron":
			return { type: "octahedronGeometry", args: [40, 0] };
		case "Tetrahedron":
			return { type: "tetrahedronGeometry", args: [40, 0] };
		case "Torus":
			return { type: "torusGeometry", args: [50, 20, 10, 10] };
		case "Torus Knot":
			return { type: "torusKnotGeometry", args: [50, 10, 20, 10] };
		default:
			return { type: "boxGeometry", args: [50, 50, 50] };
	}
}

function createGeometryNode(shape, key) {
	const spec = getGeometrySpec(shape);

	return React.createElement(spec.type, {
		key,
		args: spec.args,
	});
}

function getMaterialNode(material, props) {
	switch (material) {
		case "Basic":
			return React.createElement("meshBasicMaterial", props);
		case "Lambert":
			return React.createElement("meshLambertMaterial", props);
		case "Normal":
			return React.createElement("meshNormalMaterial", props);
		case "Phong":
			return React.createElement("meshPhongMaterial", props);
		case "Physical":
			return React.createElement("meshPhysicalMaterial", props);
		default:
			return React.createElement("meshStandardMaterial", props);
	}
}

function GeometryDisplayLayer({ display, order, frameData }) {
	const { properties = {} } = display;
	const {
		shape = "Box",
		material = "Standard",
		shading = "Smooth",
		color = "#FFFFFF",
		edges = false,
		edgeColor = "#FFFFFF",
		wireframe = false,
		x = 0,
		y = 0,
		z = 0,
		opacity = 1,
		lightIntensity = 1,
		lightDistance = 500,
		cameraZoom = 250,
	} = properties;

	const parserRef = React.useRef(new FFTParser(properties));
	const rotationRef = React.useRef({ x: 0, y: 0, z: 0 });
	const sprite = React.useMemo(
		() => new TextureLoader().load(POINT_SPRITE),
		[],
	);

	parserRef.current.update(properties);

	if (frameData?.hasUpdate && frameData.fft) {
		const fft = parserRef.current.parseFFT(frameData.fft);

		rotationRef.current.x += 5 * (fft[0] || 0);
		rotationRef.current.y += 3 * (fft[3] || 0);
		rotationRef.current.z += 2 * (fft[2] || 0);
	}

	React.useEffect(() => {
		return () => {
			if (sprite?.dispose) {
				sprite.dispose();
			}
		};
	}, [sprite]);

	const isPoints = material === "Points";
	const meshPosition = [x, -y, z];
	const meshRotation = [
		rotationRef.current.x,
		rotationRef.current.y,
		rotationRef.current.z,
	];
	const zoomScale = cameraZoom > 0 ? 250 / cameraZoom : 1;

	const children = [
		React.createElement("pointLight", {
			key: "light-0",
			intensity: lightIntensity,
			distance: lightDistance,
			position: [0, lightDistance * 2, 0],
		}),
		React.createElement("pointLight", {
			key: "light-1",
			intensity: lightIntensity,
			distance: lightDistance,
			position: [lightDistance, lightDistance * 2, lightDistance],
		}),
		React.createElement("pointLight", {
			key: "light-2",
			intensity: lightIntensity,
			distance: lightDistance,
			position: [-lightDistance, -lightDistance * 2, -lightDistance],
		}),
	];

	if (isPoints) {
		children.push(
			React.createElement(
				"points",
				{
					key: "points",
					position: meshPosition,
					rotation: meshRotation,
					renderOrder: order,
				},
				createGeometryNode(shape, "geometry"),
				React.createElement("pointsMaterial", {
					size: 5,
					sizeAttenuation: true,
					map: sprite,
					transparent: true,
					alphaTest: 0.5,
					color,
					opacity,
					depthTest: false,
					depthWrite: false,
				}),
			),
		);
	} else {
		children.push(
			React.createElement(
				"mesh",
				{
					key: "mesh",
					position: meshPosition,
					rotation: meshRotation,
					renderOrder: order,
				},
				createGeometryNode(shape, "geometry"),
				getMaterialNode(material, {
					flatShading: shading === "Flat",
					color,
					opacity,
					wireframe,
					transparent: true,
					side: material === "Basic" ? FrontSide : DoubleSide,
					depthTest: false,
					depthWrite: false,
				}),
			),
		);

		if (edges) {
			children.push(
				React.createElement(
					"mesh",
					{
						key: "edge-overlay",
						position: meshPosition,
						rotation: meshRotation,
						renderOrder: order + 0.01,
					},
					createGeometryNode(shape, "edge-geometry"),
					React.createElement("meshBasicMaterial", {
						color: edgeColor,
						wireframe: true,
						transparent: true,
						opacity: 0.9,
						depthTest: false,
						depthWrite: false,
					}),
				),
			);
		}
	}

	return React.createElement(
		"group",
		{
			scale: [zoomScale, zoomScale, zoomScale],
		},
		...children,
	);
}

export default function R3FStageRoot({
	width,
	height,
	backgroundColor,
	scenes,
	useFallback,
	fallbackTexture,
	frameData,
	frameIndex,
}) {
	const rootChildren = [
		React.createElement("color", {
			key: "background",
			attach: "background",
			args: [backgroundColor],
		}),
		React.createElement(StageCamera, {
			key: "camera",
			width,
			height,
		}),
	];

	if (useFallback) {
		rootChildren.push(
			React.createElement(FallbackLayer, {
				key: "fallback-layer",
				width,
				height,
				texture: fallbackTexture,
			}),
		);

		return React.createElement(React.Fragment, null, ...rootChildren);
	}

	let order = 1;

	for (const scene of scenes || []) {
		if (!scene?.enabled) {
			continue;
		}

		for (const display of scene.displays || []) {
			if (!display?.enabled) {
				continue;
			}

			switch (display.name) {
				case "ImageDisplay": {
					const src = display.properties?.src;

					if (!src || src === BLANK_IMAGE) {
						break;
					}

					rootChildren.push(
						React.createElement(ImageDisplayLayer, {
							key: display.id,
							display,
							order,
						}),
					);
					break;
				}

				case "VideoDisplay": {
					rootChildren.push(
						React.createElement(VideoDisplayLayer, {
							key: display.id,
							display,
							order,
						}),
					);
					break;
				}

				case "TextDisplay": {
					rootChildren.push(
						React.createElement(TextDisplayLayer, {
							key: display.id,
							display,
							order,
							frameData,
							frameIndex,
						}),
					);
					break;
				}

				case "ShapeDisplay": {
					rootChildren.push(
						React.createElement(ShapeDisplayLayer, {
							key: display.id,
							display,
							order,
							frameData,
							frameIndex,
						}),
					);
					break;
				}

				case "BarSpectrumDisplay": {
					rootChildren.push(
						React.createElement(BarSpectrumDisplayLayer, {
							key: display.id,
							display,
							order,
							frameData,
							frameIndex,
						}),
					);
					break;
				}

				case "WaveSpectrumDisplay": {
					rootChildren.push(
						React.createElement(WaveSpectrumDisplayLayer, {
							key: display.id,
							display,
							order,
							frameData,
							frameIndex,
						}),
					);
					break;
				}

				case "SoundWaveDisplay": {
					rootChildren.push(
						React.createElement(SoundWaveDisplayLayer, {
							key: display.id,
							display,
							order,
							frameData,
							frameIndex,
						}),
					);
					break;
				}

				case "GeometryDisplay": {
					rootChildren.push(
						React.createElement(GeometryDisplayLayer, {
							key: display.id,
							display,
							order,
							frameData,
						}),
					);
					break;
				}

				default:
					break;
			}

			order += 1;
		}
	}

	return React.createElement(React.Fragment, null, ...rootChildren);
}

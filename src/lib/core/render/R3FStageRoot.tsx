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
	AddEquation,
	AdditiveBlending,
	CanvasTexture,
	CustomBlending,
	DoubleSide,
	FrontSide,
	MultiplyBlending,
	NormalBlending,
	OneFactor,
	SubtractiveBlending,
	TextureLoader,
	VideoTexture,
	ZeroFactor,
} from "three";

const TRIANGLE_ANGLE = (2 * Math.PI) / 3;
const HEXAGON_ANGLE = (2 * Math.PI) / 6;
const WAVELENGTH_MAX = 0.25;
const LUMA = [0.2126, 0.7152, 0.0722];

const LAYER_VERTEX_SHADER = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const LAYER_FRAGMENT_SHADER = `
uniform sampler2D map;
uniform float opacity;
uniform float inverse;
uniform vec3 luma;
uniform float shiftAmount;
uniform float shiftAngle;
uniform float enableMask;
uniform float enableShift;
uniform float distortionAmount;
uniform float distortionTime;
uniform float enableDistortion;
varying vec2 vUv;

vec4 sampleLayerTexture(vec2 uv) {
	vec2 sampleUv = uv;

	if (enableDistortion > 0.5) {
		float frequency = 6.0;
		float amplitude = 0.015 * distortionAmount;
		float x = sampleUv.y * frequency + distortionTime * 0.7;
		float y = sampleUv.x * frequency + distortionTime * 0.3;
		sampleUv.x += cos(x + y) * amplitude * cos(y);
		sampleUv.y += sin(x - y) * amplitude * cos(y);
	}

	if (enableShift < 0.5) {
		return texture2D(map, sampleUv);
	}

	vec2 offset = shiftAmount * vec2(cos(shiftAngle), sin(shiftAngle));
	vec4 cr = texture2D(map, sampleUv + offset);
	vec4 cg = texture2D(map, sampleUv);
	vec4 cb = texture2D(map, sampleUv - offset);

	return vec4(cr.r, cg.g, cb.b, (cr.a + cg.a + cb.a) / 3.0);
}

void main() {
	vec4 tex = sampleLayerTexture(vUv) * opacity;

	if (enableMask > 0.5) {
		float lightness = dot(tex.rgb, luma);
		float alpha = inverse > 0.5 ? 1.0 - lightness : lightness;
		gl_FragColor = vec4(0.0, 0.0, 0.0, clamp(alpha, 0.0, 1.0));
		return;
	}

	gl_FragColor = tex;
}
`;

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
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
	sceneEffects,
	sceneWidth,
	renderOrder,
}) {
	const position = [x + (width / 2 - originX), -y + (height / 2 - originY), 0];
	const finalOpacity = Math.max(
		0,
		Math.min(1, Number(opacity ?? 1) * Number(sceneOpacity ?? 1)),
	);

	const materialProps = {
		map: texture,
		transparent: true,
		opacity: finalOpacity,
		toneMapped: false,
		depthTest: false,
		depthWrite: false,
		blending: getThreeBlending(sceneBlendMode),
	};

	const rgbShift = getRGBShiftProps(sceneEffects, sceneWidth);
	const distortion = getDistortionProps(sceneEffects);
	const useShaderMaterial = sceneMask || rgbShift.enabled || distortion.enabled;

	if (useShaderMaterial) {
		const blendDstAlpha = sceneMaskCombine === "add" ? OneFactor : ZeroFactor;

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
			React.createElement("shaderMaterial", {
				uniforms: {
					map: { value: texture },
					opacity: { value: finalOpacity },
					inverse: { value: sceneInverse ? 1 : 0 },
					luma: { value: LUMA },
					shiftAmount: { value: rgbShift.amount },
					shiftAngle: { value: rgbShift.angle },
					enableMask: { value: sceneMask ? 1 : 0 },
					enableShift: { value: rgbShift.enabled ? 1 : 0 },
					distortionAmount: { value: distortion.amount },
					distortionTime: { value: distortion.time },
					enableDistortion: { value: distortion.enabled ? 1 : 0 },
				},
				vertexShader: LAYER_VERTEX_SHADER,
				fragmentShader: LAYER_FRAGMENT_SHADER,
				transparent: true,
				depthTest: false,
				depthWrite: false,
				blending: sceneMask ? CustomBlending : getThreeBlending(sceneBlendMode),
				blendEquation: sceneMask ? AddEquation : undefined,
				blendSrc: sceneMask ? ZeroFactor : undefined,
				blendDst: sceneMask ? OneFactor : undefined,
				blendEquationAlpha: sceneMask ? AddEquation : undefined,
				blendSrcAlpha: sceneMask ? OneFactor : undefined,
				blendDstAlpha: sceneMask ? blendDstAlpha : undefined,
			}),
		);
	}

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
		React.createElement("meshBasicMaterial", materialProps),
	);
}

function getThreeBlending(blendMode = "Normal") {
	switch (blendMode) {
		case "Add":
			return AdditiveBlending;
		case "Multiply":
			return MultiplyBlending;
		case "Subtract":
			return SubtractiveBlending;
		default:
			return NormalBlending;
	}
}

function getRGBShiftProps(sceneEffects, sceneWidth) {
	const rgbShift = (sceneEffects || []).find(
		(effect) => effect?.enabled && effect.name === "RGBShiftEffect",
	);

	if (!rgbShift) {
		return {
			enabled: false,
			amount: 0,
			angle: 0,
		};
	}

	const offset = Number(rgbShift.properties?.offset || 0);
	const angle = Number(rgbShift.properties?.angle || 0);

	return {
		enabled: true,
		amount: offset / Math.max(1, Number(sceneWidth || 1)),
		angle: toRadians(angle),
	};
}

function getDistortionProps(sceneEffects) {
	const distortion = (sceneEffects || []).find(
		(effect) => effect?.enabled && effect.name === "DistortionEffect",
	);

	if (!distortion) {
		return {
			enabled: false,
			amount: 0,
			time: 0,
		};
	}

	const baseAmount = Number(distortion.properties?.amount || 0);
	const amount = baseAmount * 30;
	const time = Number(distortion.time || distortion.properties?.time || 0);

	return {
		enabled: true,
		amount,
		time,
	};
}

function ImageDisplayLayer({
	display,
	order,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
	sceneEffects,
	sceneWidth,
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
		sceneOpacity,
		sceneBlendMode,
		sceneMask,
		sceneInverse,
		sceneMaskCombine,
		sceneEffects,
		sceneWidth,
		renderOrder: order,
	});
}

function VideoDisplayLayer({
	display,
	order,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
	sceneEffects,
	sceneWidth,
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
		sceneOpacity,
		sceneBlendMode,
		sceneMask,
		sceneInverse,
		sceneMaskCombine,
		sceneEffects,
		sceneWidth,
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

function CanvasTextureLayer({
	display,
	order,
	frameData,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
	sceneEffects,
	sceneWidth,
	drawFrame,
}) {
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
		sceneOpacity,
		sceneBlendMode,
		sceneMask,
		sceneInverse,
		sceneMaskCombine,
		sceneEffects,
		sceneWidth,
		renderOrder: order,
	});
}

function TextDisplayLayer({
	display,
	order,
	frameData,
	frameIndex,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
	sceneEffects,
	sceneWidth,
}) {
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
		sceneOpacity,
		sceneBlendMode,
		sceneMask,
		sceneInverse,
		sceneMaskCombine,
		sceneEffects,
		sceneWidth,
		drawFrame,
	});
}

function ShapeDisplayLayer({
	display,
	order,
	frameData,
	frameIndex,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
	sceneEffects,
	sceneWidth,
}) {
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
		sceneOpacity,
		sceneBlendMode,
		sceneMask,
		sceneInverse,
		sceneMaskCombine,
		sceneEffects,
		sceneWidth,
		drawFrame,
	});
}

function BarSpectrumDisplayLayer({
	display,
	order,
	frameData,
	frameIndex,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
	sceneEffects,
	sceneWidth,
}) {
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
		sceneOpacity,
		sceneBlendMode,
		sceneMask,
		sceneInverse,
		sceneMaskCombine,
		sceneEffects,
		sceneWidth,
		drawFrame,
	});
}

function WaveSpectrumDisplayLayer({
	display,
	order,
	frameData,
	frameIndex,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
	sceneEffects,
	sceneWidth,
}) {
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
		sceneOpacity,
		sceneBlendMode,
		sceneMask,
		sceneInverse,
		sceneMaskCombine,
		sceneEffects,
		sceneWidth,
		drawFrame,
	});
}

function SoundWaveDisplayLayer({
	display,
	order,
	frameData,
	frameIndex,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
	sceneEffects,
	sceneWidth,
}) {
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
		sceneOpacity,
		sceneBlendMode,
		sceneMask,
		sceneInverse,
		sceneMaskCombine,
		sceneEffects,
		sceneWidth,
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

function GeometryDisplayLayer({
	display,
	order,
	frameData,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
}) {
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
	const finalOpacity = Math.max(
		0,
		Math.min(1, Number(opacity ?? 1) * Number(sceneOpacity ?? 1)),
	);
	const blending = sceneMask
		? CustomBlending
		: getThreeBlending(sceneBlendMode);
	const geometryColor = sceneMask ? "#000000" : color;
	const edgeOpacity = sceneMask
		? Number(sceneInverse ? 1 : 0)
		: 0.9 * Number(sceneOpacity ?? 1);

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
					color: geometryColor,
					opacity: finalOpacity,
					depthTest: false,
					depthWrite: false,
					blending,
					blendEquation: sceneMask ? AddEquation : undefined,
					blendSrc: sceneMask ? ZeroFactor : undefined,
					blendDst: sceneMask ? OneFactor : undefined,
					blendEquationAlpha: sceneMask ? AddEquation : undefined,
					blendSrcAlpha: sceneMask ? OneFactor : undefined,
					blendDstAlpha: sceneMask ? ZeroFactor : undefined,
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
					color: geometryColor,
					opacity: finalOpacity,
					wireframe,
					transparent: true,
					side: material === "Basic" ? FrontSide : DoubleSide,
					depthTest: false,
					depthWrite: false,
					blending,
					blendEquation: sceneMask ? AddEquation : undefined,
					blendSrc: sceneMask ? ZeroFactor : undefined,
					blendDst: sceneMask ? OneFactor : undefined,
					blendEquationAlpha: sceneMask ? AddEquation : undefined,
					blendSrcAlpha: sceneMask ? OneFactor : undefined,
					blendDstAlpha: sceneMask ? ZeroFactor : undefined,
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
						opacity: edgeOpacity,
						depthTest: false,
						depthWrite: false,
						blending,
						blendEquation: sceneMask ? AddEquation : undefined,
						blendSrc: sceneMask ? ZeroFactor : undefined,
						blendDst: sceneMask ? OneFactor : undefined,
						blendEquationAlpha: sceneMask ? AddEquation : undefined,
						blendSrcAlpha: sceneMask ? OneFactor : undefined,
						blendDstAlpha: sceneMask ? ZeroFactor : undefined,
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

		const sceneOpacity = Number(scene.properties?.opacity ?? 1);
		const sceneBlendMode = scene.properties?.blendMode || "Normal";
		const sceneMask = Boolean(scene.properties?.mask);
		const sceneInverse = Boolean(scene.properties?.inverse);
		const sceneEffects = (scene.effects || []).filter(
			(effect) => effect?.enabled,
		);
		const enabledDisplayCount = (scene.displays || []).filter(
			(display) => display?.enabled,
		).length;
		const sceneMaskCombine =
			sceneMask && !sceneInverse && enabledDisplayCount > 1 ? "add" : "replace";

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
							sceneOpacity,
							sceneBlendMode,
							sceneMask,
							sceneInverse,
							sceneMaskCombine,
							sceneEffects,
							sceneWidth: width,
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
							sceneOpacity,
							sceneBlendMode,
							sceneMask,
							sceneInverse,
							sceneMaskCombine,
							sceneEffects,
							sceneWidth: width,
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
							sceneOpacity,
							sceneBlendMode,
							sceneMask,
							sceneInverse,
							sceneMaskCombine,
							sceneEffects,
							sceneWidth: width,
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
							sceneOpacity,
							sceneBlendMode,
							sceneMask,
							sceneInverse,
							sceneMaskCombine,
							sceneEffects,
							sceneWidth: width,
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
							sceneOpacity,
							sceneBlendMode,
							sceneMask,
							sceneInverse,
							sceneMaskCombine,
							sceneEffects,
							sceneWidth: width,
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
							sceneOpacity,
							sceneBlendMode,
							sceneMask,
							sceneInverse,
							sceneMaskCombine,
							sceneEffects,
							sceneWidth: width,
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
							sceneOpacity,
							sceneBlendMode,
							sceneMask,
							sceneInverse,
							sceneMaskCombine,
							sceneEffects,
							sceneWidth: width,
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
							sceneOpacity,
							sceneBlendMode,
							sceneMask,
							sceneInverse,
							sceneEffects,
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

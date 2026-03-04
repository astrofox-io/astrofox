// @ts-nocheck
import FFTParser from "@/lib/audio/FFTParser";
import WaveParser from "@/lib/audio/WaveParser";
import CanvasBars from "@/lib/canvas/CanvasBars";
import CanvasText from "@/lib/canvas/CanvasText";
import CanvasWave from "@/lib/canvas/CanvasWave";
import {
	PPBlurEffect,
	PPColorHalftoneEffect,
	PPDistortionEffect,
	PPGlowEffect,
	PPHexPixelateEffect,
	PPKaleidoscopeEffect,
	PPLEDEffect,
	PPMirrorEffect,
	PPRGBShiftEffect,
} from "@/lib/postprocessing";
import { BLANK_IMAGE } from "@/app/constants";
import {
	ASCII,
	Bloom,
	BrightnessContrast,
	ColorAverage,
	ColorDepth,
	DotScreen,
	EffectComposer,
	Glitch,
	Grid,
	HueSaturation,
	Noise,
	Pixelation,
	Scanline as ScanlinePP,
	Sepia,
	TiltShift2,
	ToneMapping,
	Vignette,
} from "@react-three/postprocessing";
import {
	BlendFunction,
	EffectComposer as RawEffectComposer,
	EffectPass,
	GlitchMode,
	RenderPass,
	BloomEffect as RawBloomEffect,
	BrightnessContrastEffect as RawBrightnessContrastEffect,
	ColorAverageEffect as RawColorAverageEffect,
	ColorDepthEffect as RawColorDepthEffect,
	DotScreenEffect as RawDotScreenEffect,
	GlitchEffect as RawGlitchEffect,
	GridEffect as RawGridEffect,
	HueSaturationEffect as RawHueSaturationEffect,
	NoiseEffect as RawNoiseEffect,
	PixelationEffect as RawPixelationEffect,
	ScanlineEffect as RawScanlineEffect,
	SepiaEffect as RawSepiaEffect,
	TiltShiftEffect as RawTiltShiftEffect,
	ToneMappingEffect as RawToneMappingEffect,
	VignetteEffect as RawVignetteEffect,
	ASCIIEffect as RawASCIIEffect,
} from "postprocessing";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import React from "react";
import {
	AddEquation,
	AdditiveBlending,
	CanvasTexture,
	Color,
	CustomBlending,
	DoubleSide,
	FrontSide,
	HalfFloatType,
	LinearFilter,
	Mesh as ThreeMesh,
	MeshBasicMaterial as ThreeMeshBasicMaterial,
	MultiplyBlending,
	NormalBlending,
	OneFactor,
	OrthographicCamera,
	PerspectiveCamera,
	PlaneGeometry as ThreePlaneGeometry,
	RGBAFormat,
	Scene as ThreeScene,
	SubtractiveBlending,
	TextureLoader,
	Vector2,
	VideoTexture,
	WebGLRenderTarget,
	ZeroFactor,
} from "three";

const TRIANGLE_ANGLE = (2 * Math.PI) / 3;
const HEXAGON_ANGLE = (2 * Math.PI) / 6;
const WAVELENGTH_MAX = 0.25;
const LUMA = [0.2126, 0.7152, 0.0722];

const MASK_VERTEX_SHADER = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const MASK_FRAGMENT_SHADER = `
uniform sampler2D map;
uniform float opacity;
uniform float inverse;
uniform vec3 luma;
varying vec2 vUv;

void main() {
	vec4 tex = texture2D(map, vUv) * opacity;
	float lightness = dot(tex.rgb, luma);
	float alpha = inverse > 0.5 ? 1.0 - lightness : lightness;
	gl_FragColor = vec4(0.0, 0.0, 0.0, clamp(alpha, 0.0, 1.0));
}
`;

function toRadians(value = 0) {
	return (Number(value) * Math.PI) / 180;
}

function FallbackLayer({ width, height, texture }) {
	if (!texture || width <= 0 || height <= 0) {
		return null;
	}

	return (
		<mesh renderOrder={0}>
			<planeGeometry args={[width, height]} />
			<meshBasicMaterial
				map={texture}
				transparent={true}
				toneMapped={false}
				depthTest={false}
				depthWrite={false}
			/>
		</mesh>
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
	renderOrder,
}) {
	const position = [x + (width / 2 - originX), -y + (height / 2 - originY), 0];
	const planeWidth = Math.max(1, width);
	const planeHeight = Math.max(1, height);
	const planeScale = [planeWidth * zoom, planeHeight * zoom, 1];
	const finalOpacity = Math.max(
		0,
		Math.min(1, Number(opacity ?? 1) * Number(sceneOpacity ?? 1)),
	);

	if (sceneMask) {
		const blendDstAlpha = sceneMaskCombine === "add" ? OneFactor : ZeroFactor;

		return (
			<mesh
				position={position}
				rotation={[0, 0, -toRadians(rotation)]}
				scale={planeScale}
				renderOrder={renderOrder}
			>
				<planeGeometry args={[1, 1]} />
				<shaderMaterial
					uniforms={{
						map: { value: texture },
						opacity: { value: finalOpacity },
						inverse: { value: sceneInverse ? 1 : 0 },
						luma: { value: LUMA },
					}}
					vertexShader={MASK_VERTEX_SHADER}
					fragmentShader={MASK_FRAGMENT_SHADER}
					transparent={true}
					depthTest={false}
					depthWrite={false}
					blending={CustomBlending}
					blendEquation={AddEquation}
					blendSrc={ZeroFactor}
					blendDst={OneFactor}
					blendEquationAlpha={AddEquation}
					blendSrcAlpha={OneFactor}
					blendDstAlpha={blendDstAlpha}
				/>
			</mesh>
		);
	}

	return (
		<mesh
			position={position}
			rotation={[0, 0, -toRadians(rotation)]}
			scale={planeScale}
			renderOrder={renderOrder}
		>
			<planeGeometry args={[1, 1]} />
			<meshBasicMaterial
				map={texture}
				transparent={true}
				premultipliedAlpha={sceneBlendMode === "Multiply"}
				opacity={finalOpacity}
				toneMapped={false}
				depthTest={false}
				depthWrite={false}
				blending={getThreeBlending(sceneBlendMode)}
			/>
		</mesh>
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

// --- Effect Wrapper Components ---

function PPMirrorWrapper({ side }) {
	const effect = React.useMemo(() => new PPMirrorEffect({ side }), []);
	React.useEffect(() => {
		effect.uniforms.get("side").value = Number(side || 0);
	}, [effect, side]);
	return <primitive object={effect} dispose={null} />;
}

function PPKaleidoscopeWrapper({ sides, angle }) {
	const effect = React.useMemo(
		() => new PPKaleidoscopeEffect({ sides, angle }),
		[],
	);
	React.useEffect(() => {
		effect.uniforms.get("sides").value = Math.max(1, Number(sides || 6));
		effect.uniforms.get("angle").value = toRadians(Number(angle || 0));
	}, [effect, sides, angle]);
	return <primitive object={effect} dispose={null} />;
}

function PPDistortionWrapper({ amount, time }) {
	const effect = React.useMemo(
		() =>
			new PPDistortionEffect({
				amount: Number(amount || 0) * 30,
				time: Number(time || 0),
			}),
		[],
	);
	React.useEffect(() => {
		effect.uniforms.get("amount").value = Number(amount || 0) * 30;
	}, [effect, amount]);
	React.useEffect(() => {
		effect.uniforms.get("time").value = Number(time || 0);
	}, [effect, time]);
	return <primitive object={effect} dispose={null} />;
}

function PPRGBShiftWrapper({ offset, angle, width }) {
	const effect = React.useMemo(
		() => new PPRGBShiftEffect({ offset: 0, angle: 0 }),
		[],
	);
	React.useEffect(() => {
		const normalizedOffset =
			Number(offset || 0) / Math.max(1, Number(width || 1));
		effect.uniforms.get("offset").value = normalizedOffset;
		effect.uniforms.get("angle").value = toRadians(Number(angle || 0));
	}, [effect, offset, angle, width]);
	return <primitive object={effect} dispose={null} />;
}

function PPColorHalftoneWrapper({ scale, angle, width, height }) {
	const effect = React.useMemo(
		() => new PPColorHalftoneEffect({ scale: 1, angle: 0, width, height }),
		[],
	);
	React.useEffect(() => {
		effect.uniforms.get("scale").value = 1 - Number(scale || 0);
		effect.uniforms.get("angle").value = toRadians(Number(angle || 0));
		const res = effect.uniforms.get("sceneResolution").value;
		res.set(width, height);
	}, [effect, scale, angle, width, height]);
	return <primitive object={effect} dispose={null} />;
}

function PPLEDWrapper({ spacing, size, blur, width, height }) {
	const effect = React.useMemo(
		() => new PPLEDEffect({ spacing: 10, size: 4, blur: 4, width, height }),
		[],
	);
	React.useEffect(() => {
		effect.uniforms.get("spacing").value = Math.max(1, Number(spacing || 10));
		effect.uniforms.get("size").value = Number(size || 4);
		effect.uniforms.get("blur").value = Number(blur || 4);
		const res = effect.uniforms.get("sceneResolution").value;
		res.set(width, height);
	}, [effect, spacing, size, blur, width, height]);
	return <primitive object={effect} dispose={null} />;
}

function PPGlowWrapper({ amount, intensity, width, height }) {
	const effect = React.useMemo(
		() => new PPGlowEffect({ amount: 0, intensity: 1, width, height }),
		[],
	);
	React.useEffect(() => {
		effect.uniforms.get("amount").value = Number(amount || 0) * 5;
		effect.uniforms.get("intensity").value = Number(intensity || 1);
		const res = effect.uniforms.get("sceneResolution").value;
		res.set(width, height);
	}, [effect, amount, intensity, width, height]);
	return <primitive object={effect} dispose={null} />;
}

function PPHexPixelateWrapper({ size, width, height }) {
	const effect = React.useMemo(
		() => new PPHexPixelateEffect({ size: 10, width, height }),
		[],
	);
	React.useEffect(() => {
		effect.uniforms.get("size").value = Number(size || 10);
		const res = effect.uniforms.get("sceneResolution").value;
		res.set(width, height);
	}, [effect, size, width, height]);
	return <primitive object={effect} dispose={null} />;
}

function PPBlurWrapper({
	type,
	amount,
	x,
	y,
	radius,
	brightness,
	angle,
	width,
	height,
}) {
	const blurTypeMap = {
		Box: 0,
		Circular: 1,
		Gaussian: 2,
		Triangle: 3,
		Zoom: 4,
		Lens: 5,
	};
	const blurType = blurTypeMap[type] ?? 2;

	const effect = React.useMemo(
		() => new PPBlurEffect({ amount: 0, blurType, width, height }),
		[],
	);
	React.useEffect(() => {
		effect.uniforms.get("amount").value = Number(amount || 0);
		effect.uniforms.get("blurType").value = blurType;
		const centerX = Math.max(
			0,
			Math.min(1, (Number(x || 0) + width / 2) / width),
		);
		const centerY = Math.max(
			0,
			Math.min(1, (Number(y || 0) + height / 2) / height),
		);
		effect.uniforms.get("centerX").value = centerX;
		effect.uniforms.get("centerY").value = centerY;
		effect.uniforms.get("radius").value = Number(radius || 10);
		effect.uniforms.get("brightness").value = Number(brightness || 0);
		effect.uniforms.get("blurAngle").value = toRadians(Number(angle || 0));
		const res = effect.uniforms.get("sceneResolution").value;
		res.set(width, height);
	}, [effect, type, amount, x, y, radius, brightness, angle, width, height]);
	return <primitive object={effect} dispose={null} />;
}

// --- Raw Effect Factory (for per-scene postprocessing) ---

function createRawEffect(effectConfig, width, height) {
	const props = effectConfig.properties || {};

	switch (effectConfig.name) {
		case "BloomEffect": {
			const amount = Number(props.amount ?? 0);
			const threshold = Number(props.threshold ?? 1);
			const blendMode =
				props.blendMode === "Screen" ? BlendFunction.SCREEN : BlendFunction.ADD;
			return new RawBloomEffect({
				intensity: amount * 10,
				luminanceThreshold: threshold,
				luminanceSmoothing: 0.025,
				blendFunction: blendMode,
			});
		}
		case "PixelateEffect": {
			const size = Number(props.size || 10);
			const type = props.type || "Square";
			if (type === "Hexagon") {
				return new PPHexPixelateEffect({ size, width, height });
			}
			return new RawPixelationEffect(size);
		}
		case "DotScreenEffect": {
			const scale = Number(props.scale || 0);
			const angle = Number(props.angle || 0);
			return new RawDotScreenEffect({ scale: 2 - scale * 2, angle: toRadians(angle) });
		}
		case "RGBShiftEffect": {
			const normalizedOffset =
				Number(props.offset || 0) / Math.max(1, Number(width || 1));
			return new PPRGBShiftEffect({
				offset: normalizedOffset,
				angle: toRadians(Number(props.angle || 0)),
			});
		}
		case "MirrorEffect":
			return new PPMirrorEffect({ side: Number(props.side || 0) });
		case "KaleidoscopeEffect":
			return new PPKaleidoscopeEffect({
				sides: Math.max(1, Number(props.sides || 6)),
				angle: toRadians(Number(props.angle || 0)),
			});
		case "DistortionEffect":
			return new PPDistortionEffect({
				amount: Number(props.amount || 0) * 30,
				time: Number(effectConfig.time || 0),
			});
		case "GlitchEffect": {
			const mode =
				props.mode === "Constant"
					? GlitchMode.CONSTANT_WILD
					: GlitchMode.SPORADIC;
			const strength = Number(props.strength ?? 0.3);
			return new RawGlitchEffect({
				mode,
				strength: new Vector2(strength * 0.5, strength),
				columns: Number(props.columns ?? 0.05),
				ratio: Number(props.ratio ?? 0.85),
			});
		}
		case "ColorHalftoneEffect":
			return new PPColorHalftoneEffect({
				scale: 1 - Number(props.scale || 0),
				angle: toRadians(Number(props.angle || 0)),
				width,
				height,
			});
		case "LEDEffect":
			return new PPLEDEffect({
				spacing: Math.max(1, Number(props.spacing || 10)),
				size: Number(props.size || 4),
				blur: Number(props.blur || 4),
				width,
				height,
			});
		case "GlowEffect":
			return new PPGlowEffect({
				amount: Number(props.amount || 0) * 5,
				intensity: Number(props.intensity || 1),
				width,
				height,
			});
		case "BlurEffect": {
			const blurTypeMap = { Box: 0, Circular: 1, Gaussian: 2, Triangle: 3, Zoom: 4, Lens: 5 };
			return new PPBlurEffect({
				amount: Number(props.amount || 0),
				blurType: blurTypeMap[props.type] ?? 2,
				width,
				height,
			});
		}
		case "BrightnessContrastEffect":
			return new RawBrightnessContrastEffect({
				brightness: Number(props.brightness ?? 0),
				contrast: Number(props.contrast ?? 0),
			});
		case "ColorAverageEffect":
			return new RawColorAverageEffect(BlendFunction.NORMAL);
		case "ColorDepthEffect":
			return new RawColorDepthEffect({ bits: Number(props.bits ?? 16) });
		case "GridEffect":
			return new RawGridEffect({
				scale: Number(props.scale ?? 1.0),
				lineWidth: Number(props.lineWidth ?? 0.5),
			});
		case "HueSaturationEffect":
			return new RawHueSaturationEffect({
				hue: toRadians(Number(props.hue ?? 0)),
				saturation: Number(props.saturation ?? 0),
			});
		case "NoiseEffect":
			return new RawNoiseEffect({
				premultiply: !!props.premultiply,
				blendFunction: BlendFunction.ADD,
			});
		case "ScanlineEffect":
			return new RawScanlineEffect({ density: Number(props.density ?? 1.25) });
		case "SepiaEffect":
			return new RawSepiaEffect({ intensity: Number(props.intensity ?? 1.0) });
		case "ToneMappingEffect":
			return new RawToneMappingEffect({
				middleGrey: Number(props.middleGrey ?? 0.6),
				maxLuminance: Number(props.maxLuminance ?? 16),
				averageLuminance: Number(props.averageLuminance ?? 1.0),
				adaptationRate: Number(props.adaptationRate ?? 1.0),
			});
		case "VignetteEffect":
			return new RawVignetteEffect({
				offset: Number(props.offset ?? 0.5),
				darkness: Number(props.darkness ?? 0.5),
			});
		case "ASCIIEffect":
			return new RawASCIIEffect({
				fontSize: Number(props.fontSize ?? 54),
				cellSize: Number(props.cellSize ?? 16),
				color: String(props.color ?? "#ffffff"),
				invert: !!props.invert,
			});
		case "TiltShiftEffect":
			return new RawTiltShiftEffect({
				blur: Number(props.blur ?? 0.15),
				taper: Number(props.taper ?? 0.5),
				samples: Number(props.samples ?? 10),
			});
		default:
			return null;
	}
}

// --- EffectBridge ---

function EffectBridge({ effect, width, height }) {
	const props = effect.properties || {};

	switch (effect.name) {
		case "BloomEffect": {
			const amount = Number(props.amount ?? 0);
			const threshold = Number(props.threshold ?? 1);
			const blendMode =
				props.blendMode === "Screen" ? BlendFunction.SCREEN : BlendFunction.ADD;
			return (
				<Bloom
					intensity={amount * 10}
					luminanceThreshold={threshold}
					luminanceSmoothing={0.025}
					blendFunction={blendMode}
				/>
			);
		}

		case "PixelateEffect": {
			const size = Number(props.size || 10);
			const type = props.type || "Square";
			if (type === "Hexagon") {
				return (
					<PPHexPixelateWrapper size={size} width={width} height={height} />
				);
			}
			return <Pixelation granularity={size} />;
		}

		case "DotScreenEffect": {
			const scale = Number(props.scale || 0);
			const angle = Number(props.angle || 0);
			return <DotScreen scale={2 - scale * 2} angle={toRadians(angle)} />;
		}

		case "RGBShiftEffect":
			return (
				<PPRGBShiftWrapper
					offset={props.offset}
					angle={props.angle}
					width={width}
				/>
			);

		case "MirrorEffect":
			return <PPMirrorWrapper side={props.side} />;

		case "KaleidoscopeEffect":
			return <PPKaleidoscopeWrapper sides={props.sides} angle={props.angle} />;

		case "DistortionEffect":
			return <PPDistortionWrapper amount={props.amount} time={effect.time} />;

		case "GlitchEffect": {
			const mode =
				props.mode === "Constant"
					? GlitchMode.CONSTANT_WILD
					: GlitchMode.SPORADIC;
			const strength = Number(props.strength ?? 0.3);
			return (
				<Glitch
					mode={mode}
					strength={new Vector2(strength * 0.5, strength)}
					columns={Number(props.columns ?? 0.05)}
					ratio={Number(props.ratio ?? 0.85)}
				/>
			);
		}

		case "ColorHalftoneEffect":
			return (
				<PPColorHalftoneWrapper
					scale={props.scale}
					angle={props.angle}
					width={width}
					height={height}
				/>
			);

		case "LEDEffect":
			return (
				<PPLEDWrapper
					spacing={props.spacing}
					size={props.size}
					blur={props.blur}
					width={width}
					height={height}
				/>
			);

		case "GlowEffect":
			return (
				<PPGlowWrapper
					amount={props.amount}
					intensity={props.intensity}
					width={width}
					height={height}
				/>
			);

		case "BlurEffect":
			return (
				<PPBlurWrapper
					type={props.type}
					amount={props.amount}
					x={props.x}
					y={props.y}
					radius={props.radius}
					brightness={props.brightness}
					angle={props.angle}
					width={width}
					height={height}
				/>
			);

		case "BrightnessContrastEffect": {
			const brightness = Number(props.brightness ?? 0);
			const contrast = Number(props.contrast ?? 0);
			return <BrightnessContrast brightness={brightness} contrast={contrast} />;
		}

		case "ColorAverageEffect":
			return <ColorAverage blendFunction={BlendFunction.NORMAL} />;

		case "ColorDepthEffect": {
			const bits = Number(props.bits ?? 16);
			return <ColorDepth bits={bits} />;
		}

		case "GridEffect": {
			const scale = Number(props.scale ?? 1.0);
			const lineWidth = Number(props.lineWidth ?? 0.5);
			return <Grid scale={scale} lineWidth={lineWidth} />;
		}

		case "HueSaturationEffect": {
			const hue = toRadians(Number(props.hue ?? 0));
			const saturation = Number(props.saturation ?? 0);
			return <HueSaturation hue={hue} saturation={saturation} />;
		}

		case "NoiseEffect": {
			const premultiply = !!props.premultiply;
			return (
				<Noise premultiply={premultiply} blendFunction={BlendFunction.ADD} />
			);
		}

		case "ScanlineEffect": {
			const density = Number(props.density ?? 1.25);
			return <ScanlinePP density={density} />;
		}

		case "SepiaEffect": {
			const intensity = Number(props.intensity ?? 1.0);
			return <Sepia intensity={intensity} />;
		}

		case "ToneMappingEffect": {
			const middleGrey = Number(props.middleGrey ?? 0.6);
			const maxLuminance = Number(props.maxLuminance ?? 16);
			const averageLuminance = Number(props.averageLuminance ?? 1.0);
			const adaptationRate = Number(props.adaptationRate ?? 1.0);
			return (
				<ToneMapping
					middleGrey={middleGrey}
					maxLuminance={maxLuminance}
					averageLuminance={averageLuminance}
					adaptationRate={adaptationRate}
				/>
			);
		}

		case "VignetteEffect": {
			const offset = Number(props.offset ?? 0.5);
			const darkness = Number(props.darkness ?? 0.5);
			return <Vignette offset={offset} darkness={darkness} />;
		}

		case "ASCIIEffect": {
			const fontSize = Number(props.fontSize ?? 54);
			const cellSize = Number(props.cellSize ?? 16);
			const color = String(props.color ?? "#ffffff");
			const invert = !!props.invert;
			return (
				<ASCII
					fontSize={fontSize}
					cellSize={cellSize}
					color={color}
					invert={invert}
				/>
			);
		}

		case "TiltShiftEffect": {
			const blur = Number(props.blur ?? 0.15);
			const taper = Number(props.taper ?? 0.5);
			const samples = Number(props.samples ?? 10);
			return <TiltShift2 blur={blur} taper={taper} samples={samples} />;
		}

		default:
			return null;
	}
}

// --- Display Layer Components ---

function ImageDisplayLayer({
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
	} = properties;

	const texture = React.useMemo(() => {
		const nextTexture = new TextureLoader().load(src);
		nextTexture.minFilter = LinearFilter;
		nextTexture.magFilter = LinearFilter;
		nextTexture.generateMipmaps = false;
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

function VideoDisplayLayer({
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
	drawFrame,
}) {
	const { properties = {} } = display;
	const { x = 0, y = 0, rotation = 0, zoom = 1, opacity = 1 } = properties;

	const canvas = React.useMemo(() => document.createElement("canvas"), []);
	const [plane, setPlane] = React.useState(() => ({
		width: Math.max(1, canvas.width || 1),
		height: Math.max(1, canvas.height || 1),
		originX: Math.round((canvas.width || 1) / 2),
		originY: Math.round((canvas.height || 1) / 2),
	}));
	const textureSizeRef = React.useRef({
		width: Math.max(1, canvas.width || 1),
		height: Math.max(1, canvas.height || 1),
	});
	const texture = React.useMemo(() => {
		const nextTexture = new CanvasTexture(canvas);
		nextTexture.minFilter = LinearFilter;
		nextTexture.magFilter = LinearFilter;
		nextTexture.generateMipmaps = false;
		nextTexture.needsUpdate = true;

		return nextTexture;
	}, [canvas]);

	React.useLayoutEffect(() => {
		const ctx = canvas.getContext("2d", {
			alpha: true,
			willReadFrequently: true,
		});

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

		const nextWidth = Math.max(
			1,
			Math.round(firstPass.width || canvas.width || 1),
		);
		const nextHeight = Math.max(
			1,
			Math.round(firstPass.height || canvas.height || 1),
		);

		if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
			canvas.width = nextWidth;
			canvas.height = nextHeight;

			const redrawContext = canvas.getContext("2d", {
				alpha: true,
				willReadFrequently: true,
			});

			if (redrawContext) {
				drawFrame({
					context: redrawContext,
					canvas,
					properties,
					frameData,
				});
			}
		}

		const nextOriginX =
			firstPass.originX !== undefined
				? firstPass.originX
				: Math.round(nextWidth / 2);
		const nextOriginY =
			firstPass.originY !== undefined
				? firstPass.originY
				: Math.round(nextHeight / 2);

		if (
			plane.width !== nextWidth ||
			plane.height !== nextHeight ||
			plane.originX !== nextOriginX ||
			plane.originY !== nextOriginY
		) {
			setPlane({
				width: nextWidth,
				height: nextHeight,
				originX: nextOriginX,
				originY: nextOriginY,
			});
		}

		if (
			textureSizeRef.current.width !== nextWidth ||
			textureSizeRef.current.height !== nextHeight
		) {
			texture.dispose();
			textureSizeRef.current = {
				width: nextWidth,
				height: nextHeight,
			};
		}

		texture.image = canvas;
		texture.needsUpdate = true;
	});

	React.useEffect(() => {
		return () => {
			texture.dispose();
		};
	}, [texture]);

	const width = plane.width;
	const height = plane.height;

	return (
		<TexturePlane
			texture={texture}
			width={width}
			height={height}
			x={x}
			y={y}
			originX={plane.originX}
			originY={plane.originY}
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

function TextDisplayLayer({
	display,
	order,
	frameData,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
}) {
	const textRef = React.useRef(null);

	const drawFrame = React.useCallback(({ context, properties }) => {
		if (!textRef.current) {
			textRef.current = new CanvasText(properties, context.canvas);
		}

		textRef.current.update(properties);
		textRef.current.render();

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

	return (
		<CanvasTextureLayer
			display={display}
			order={order}
			frameData={frameData}
			sceneOpacity={sceneOpacity}
			sceneBlendMode={sceneBlendMode}
			sceneMask={sceneMask}
			sceneInverse={sceneInverse}
			sceneMaskCombine={sceneMaskCombine}
			drawFrame={drawFrame}
		/>
	);
}

function ShapeDisplayLayer({
	display,
	order,
	frameData,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
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

	return (
		<CanvasTextureLayer
			display={display}
			order={order}
			frameData={frameData}
			sceneOpacity={sceneOpacity}
			sceneBlendMode={sceneBlendMode}
			sceneMask={sceneMask}
			sceneInverse={sceneInverse}
			sceneMaskCombine={sceneMaskCombine}
			drawFrame={drawFrame}
		/>
	);
}

function BarSpectrumDisplayLayer({
	display,
	order,
	frameData,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
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
			originY: canvas.height / 2,
		};
	}, []);

	return (
		<CanvasTextureLayer
			display={display}
			order={order}
			frameData={frameData}
			sceneOpacity={sceneOpacity}
			sceneBlendMode={sceneBlendMode}
			sceneMask={sceneMask}
			sceneInverse={sceneInverse}
			sceneMaskCombine={sceneMaskCombine}
			drawFrame={drawFrame}
		/>
	);
}

function WaveSpectrumDisplayLayer({
	display,
	order,
	frameData,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
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

	return (
		<CanvasTextureLayer
			display={display}
			order={order}
			frameData={frameData}
			sceneOpacity={sceneOpacity}
			sceneBlendMode={sceneBlendMode}
			sceneMask={sceneMask}
			sceneInverse={sceneInverse}
			sceneMaskCombine={sceneMaskCombine}
			drawFrame={drawFrame}
		/>
	);
}

function SoundWaveDisplayLayer({
	display,
	order,
	frameData,
	sceneOpacity,
	sceneBlendMode,
	sceneMask,
	sceneInverse,
	sceneMaskCombine,
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

	return (
		<CanvasTextureLayer
			display={display}
			order={order}
			frameData={frameData}
			sceneOpacity={sceneOpacity}
			sceneBlendMode={sceneBlendMode}
			sceneMask={sceneMask}
			sceneInverse={sceneInverse}
			sceneMaskCombine={sceneMaskCombine}
			drawFrame={drawFrame}
		/>
	);
}

function createGeometryNode(shape, key) {
	switch (shape) {
		case "Sphere":
			return <sphereGeometry key={key} args={[40, 10, 10]} />;
		case "Dodecahedron":
			return <dodecahedronGeometry key={key} args={[40, 0]} />;
		case "Icosahedron":
			return <icosahedronGeometry key={key} args={[40, 0]} />;
		case "Octahedron":
			return <octahedronGeometry key={key} args={[40, 0]} />;
		case "Tetrahedron":
			return <tetrahedronGeometry key={key} args={[40, 0]} />;
		case "Torus":
			return <torusGeometry key={key} args={[50, 20, 10, 10]} />;
		case "Torus Knot":
			return <torusKnotGeometry key={key} args={[50, 10, 20, 10]} />;
		default:
			return <boxGeometry key={key} args={[50, 50, 50]} />;
	}
}

function getMaterialNode(material, props) {
	switch (material) {
		case "Basic":
			return <meshBasicMaterial {...props} />;
		case "Lambert":
			return <meshLambertMaterial {...props} />;
		case "Normal":
			return <meshNormalMaterial {...props} />;
		case "Phong":
			return <meshPhongMaterial {...props} />;
		case "Physical":
			return <meshPhysicalMaterial {...props} />;
		default:
			return <meshStandardMaterial {...props} />;
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

	parserRef.current.update(properties);

	if (frameData?.hasUpdate && frameData.fft) {
		const fft = parserRef.current.parseFFT(frameData.fft);

		rotationRef.current.x += 5 * (fft[0] || 0);
		rotationRef.current.y += 3 * (fft[3] || 0);
		rotationRef.current.z += 2 * (fft[2] || 0);
	}

	const meshPosition = [x, -y, 0];
	const meshRotation = [
		rotationRef.current.x,
		rotationRef.current.y,
		rotationRef.current.z,
	];
	const baseZoom = cameraZoom > 0 ? 250 / cameraZoom : 1;
	const zDepthScale = 1 + z / 500;
	const zoomScale = baseZoom * Math.max(0.01, zDepthScale);
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

	return (
		<group scale={[zoomScale, zoomScale, zoomScale]}>
			<ambientLight intensity={0.3 * lightIntensity} />
			<pointLight
				key="light-0"
				intensity={lightIntensity}
				decay={0}
				position={[0, lightDistance, 0]}
			/>
			<pointLight
				key="light-1"
				intensity={lightIntensity}
				decay={0}
				position={[lightDistance, lightDistance, lightDistance]}
			/>
			<pointLight
				key="light-2"
				intensity={lightIntensity * 0.5}
				decay={0}
				position={[-lightDistance, -lightDistance, -lightDistance]}
			/>
			<mesh
				key="mesh"
				position={meshPosition}
				rotation={meshRotation}
				renderOrder={order}
			>
				{createGeometryNode(shape, "geometry")}
				{getMaterialNode(material, {
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
				})}
			</mesh>
			{edges && (
				<mesh
					key="edge-overlay"
					position={meshPosition}
					rotation={meshRotation}
					renderOrder={order + 0.01}
				>
					{createGeometryNode(shape, "edge-geometry")}
					<meshBasicMaterial
						color={edgeColor}
						wireframe={true}
						transparent={true}
						opacity={edgeOpacity}
						depthTest={false}
						depthWrite={false}
						blending={blending}
						blendEquation={sceneMask ? AddEquation : undefined}
						blendSrc={sceneMask ? ZeroFactor : undefined}
						blendDst={sceneMask ? OneFactor : undefined}
						blendEquationAlpha={sceneMask ? AddEquation : undefined}
						blendSrcAlpha={sceneMask ? OneFactor : undefined}
						blendDstAlpha={sceneMask ? ZeroFactor : undefined}
					/>
				</mesh>
			)}
		</group>
	);
}

// --- 3D Perspective Scene ---

const PERSPECTIVE_FOV = 50;

function PerspectiveScene3D({ width, height, renderOrder = 0, children }) {
	const gl = useThree((state) => state.gl);

	const cameraZ = React.useMemo(
		() => (height / 2) / Math.tan((PERSPECTIVE_FOV / 2) * Math.PI / 180),
		[height],
	);

	const perspScene = React.useMemo(() => new ThreeScene(), []);

	const perspCamera = React.useMemo(() => {
		const cam = new PerspectiveCamera(PERSPECTIVE_FOV, width / height, 0.1, 5000);
		cam.position.set(0, 0, cameraZ);
		cam.lookAt(0, 0, 0);
		return cam;
	}, []);

	React.useEffect(() => {
		perspCamera.aspect = width / height;
		perspCamera.position.z = cameraZ;
		perspCamera.updateProjectionMatrix();
	}, [perspCamera, width, height, cameraZ]);

	const fbo = React.useMemo(
		() =>
			new WebGLRenderTarget(width, height, {
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				format: RGBAFormat,
				type: HalfFloatType,
			}),
		[],
	);

	React.useEffect(() => {
		fbo.setSize(width, height);
	}, [fbo, width, height]);

	React.useEffect(() => {
		return () => {
			fbo.dispose();
		};
	}, [fbo]);

	useFrame(() => {
		const prevClearAlpha = gl.getClearAlpha();
		gl.setClearAlpha(0);
		gl.setRenderTarget(fbo);
		gl.clear();
		gl.render(perspScene, perspCamera);
		gl.setRenderTarget(null);
		gl.setClearAlpha(prevClearAlpha);
	});

	return (
		<>
			{createPortal(children, perspScene)}
			<mesh renderOrder={renderOrder}>
				<planeGeometry args={[width, height]} />
				<meshBasicMaterial
					map={fbo.texture}
					transparent={true}
					toneMapped={false}
					depthTest={false}
					depthWrite={false}
				/>
			</mesh>
		</>
	);
}

function GeometryDisplayLayer3D({
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

	parserRef.current.update(properties);

	if (frameData?.hasUpdate && frameData.fft) {
		const fft = parserRef.current.parseFFT(frameData.fft);

		rotationRef.current.x += 5 * (fft[0] || 0);
		rotationRef.current.y += 3 * (fft[3] || 0);
		rotationRef.current.z += 2 * (fft[2] || 0);
	}

	const meshPosition = [x, -y, -z];
	const meshRotation = [
		rotationRef.current.x,
		rotationRef.current.y,
		rotationRef.current.z,
	];
	const uniformScale = cameraZoom > 0 ? 250 / cameraZoom : 1;
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

	return (
		<group scale={[uniformScale, uniformScale, uniformScale]}>
			<ambientLight intensity={0.3 * lightIntensity} />
			<pointLight
				key="light-0"
				intensity={lightIntensity}
				decay={0}
				position={[0, lightDistance, 0]}
			/>
			<pointLight
				key="light-1"
				intensity={lightIntensity}
				decay={0}
				position={[lightDistance, lightDistance, lightDistance]}
			/>
			<pointLight
				key="light-2"
				intensity={lightIntensity * 0.5}
				decay={0}
				position={[-lightDistance, -lightDistance, -lightDistance]}
			/>
			<mesh
				key="mesh"
				position={meshPosition}
				rotation={meshRotation}
				renderOrder={order}
			>
				{createGeometryNode(shape, "geometry")}
				{getMaterialNode(material, {
					flatShading: shading === "Flat",
					color: geometryColor,
					opacity: finalOpacity,
					wireframe,
					transparent: true,
					side: material === "Basic" ? FrontSide : DoubleSide,
					depthTest: true,
					depthWrite: true,
					blending,
					blendEquation: sceneMask ? AddEquation : undefined,
					blendSrc: sceneMask ? ZeroFactor : undefined,
					blendDst: sceneMask ? OneFactor : undefined,
					blendEquationAlpha: sceneMask ? AddEquation : undefined,
					blendSrcAlpha: sceneMask ? OneFactor : undefined,
					blendDstAlpha: sceneMask ? ZeroFactor : undefined,
				})}
			</mesh>
			{edges && (
				<mesh
					key="edge-overlay"
					position={meshPosition}
					rotation={meshRotation}
					renderOrder={order + 0.01}
				>
					{createGeometryNode(shape, "edge-geometry")}
					<meshBasicMaterial
						color={edgeColor}
						wireframe={true}
						transparent={true}
						opacity={edgeOpacity}
						depthTest={true}
						depthWrite={false}
						blending={blending}
						blendEquation={sceneMask ? AddEquation : undefined}
						blendSrc={sceneMask ? ZeroFactor : undefined}
						blendDst={sceneMask ? OneFactor : undefined}
						blendEquationAlpha={sceneMask ? AddEquation : undefined}
						blendSrcAlpha={sceneMask ? OneFactor : undefined}
						blendDstAlpha={sceneMask ? ZeroFactor : undefined}
					/>
				</mesh>
			)}
		</group>
	);
}

// --- Per-Scene Effects Renderer ---

function SceneWithEffects({ width, height, effects, renderOrder = 0, children }) {
	const gl = useThree((state) => state.gl);

	// Portal scene for children (2D + 3D displays)
	const sceneObj = React.useMemo(() => new ThreeScene(), []);
	const camera = React.useMemo(() => {
		const cam = new OrthographicCamera(
			-width / 2, width / 2, height / 2, -height / 2, -1000, 1000,
		);
		cam.position.set(0, 0, 10);
		cam.updateProjectionMatrix();
		return cam;
	}, []);

	React.useEffect(() => {
		camera.left = -width / 2;
		camera.right = width / 2;
		camera.top = height / 2;
		camera.bottom = -height / 2;
		camera.updateProjectionMatrix();
	}, [camera, width, height]);

	// Pre-render FBO: sceneObj is rendered here manually each frame
	const preRenderFbo = React.useMemo(
		() =>
			new WebGLRenderTarget(width, height, {
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				format: RGBAFormat,
				type: HalfFloatType,
			}),
		[],
	);

	React.useEffect(() => {
		preRenderFbo.setSize(width, height);
	}, [preRenderFbo, width, height]);

	// Quad scene: fullscreen mesh showing the pre-rendered FBO texture
	// The EffectComposer's RenderPass renders this instead of sceneObj directly
	const { quadScene, quadCamera } = React.useMemo(() => {
		const qs = new ThreeScene();
		const qc = new OrthographicCamera(-1, 1, 1, -1, -1, 1);
		const geo = new ThreePlaneGeometry(2, 2);
		const mat = new ThreeMeshBasicMaterial({
			map: preRenderFbo.texture,
			transparent: true,
			depthTest: false,
			depthWrite: false,
			toneMapped: false,
		});
		const mesh = new ThreeMesh(geo, mat);
		qs.add(mesh);
		return { quadScene: qs, quadCamera: qc };
	}, [preRenderFbo]);

	// EffectComposer
	const composerRef = React.useRef(null);

	if (!composerRef.current) {
		const c = new RawEffectComposer(gl, {
			frameBufferType: HalfFloatType,
		});
		c.autoRenderToScreen = false;
		c.setSize(width, height);
		composerRef.current = c;
	}

	React.useEffect(() => {
		composerRef.current?.setSize(width, height);
	}, [width, height]);

	React.useEffect(() => {
		return () => {
			composerRef.current?.dispose();
			preRenderFbo.dispose();
		};
	}, [preRenderFbo]);

	// Rebuild passes when effect list changes
	const effectIds = effects.map((e) => e.id + ":" + e.name).join(",");
	React.useEffect(() => {
		const composer = composerRef.current;
		if (!composer) return;

		while (composer.passes.length > 0) {
			composer.removePass(composer.passes[0]);
		}

		composer.addPass(new RenderPass(quadScene, quadCamera));

		const rawEffects = effects
			.map((e) => {
				try {
					return createRawEffect(e, width, height);
				} catch {
					return null;
				}
			})
			.filter(Boolean);

		if (rawEffects.length > 0) {
			try {
				composer.addPass(new EffectPass(quadCamera, ...rawEffects));
			} catch {
				// Effect pass failed to compile, skip effects
			}
		}
	}, [effectIds, quadScene, quadCamera, width, height]);

	const meshRef = React.useRef();

	useFrame((_, delta) => {
		const composer = composerRef.current;
		if (!composer) return;

		// Step 1: Render sceneObj (all portaled children) to pre-render FBO
		const prevClearAlpha = gl.getClearAlpha();
		gl.setClearAlpha(0);
		gl.setRenderTarget(preRenderFbo);
		gl.clear();
		gl.render(sceneObj, camera);

		// Step 2: Run EffectComposer (keep clear alpha = 0 for transparent compositing)
		try {
			composer.render(delta);
		} catch {
			// Ignore render errors
		}

		gl.setRenderTarget(null);
		gl.setClearAlpha(prevClearAlpha);

		// Step 3: Update output mesh with composited result
		if (meshRef.current) {
			meshRef.current.material.map = composer.outputBuffer.texture;
		}
	});

	return (
		<>
			{createPortal(children, sceneObj)}
			<mesh ref={meshRef} renderOrder={renderOrder}>
				<planeGeometry args={[width, height]} />
				<meshBasicMaterial
					transparent={true}
					toneMapped={false}
					depthTest={false}
					depthWrite={false}
				/>
			</mesh>
		</>
	);
}

// --- Main Component ---

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
	const bgColor = React.useMemo(
		() => new Color(backgroundColor),
		[backgroundColor],
	);

	if (useFallback) {
		return (
			<>
				<primitive key="background" attach="background" object={bgColor} />
				<FallbackLayer
					key="fallback-layer"
					width={width}
					height={height}
					texture={fallbackTexture}
				/>
			</>
		);
	}

	let order = 1;
	const sceneElements = [];

	for (const scene of scenes || []) {
		if (!scene?.enabled) {
			continue;
		}

		const sceneOpacity = Number(scene.properties?.opacity ?? 1);
		const sceneBlendMode = scene.properties?.blendMode || "Normal";
		const sceneMask = Boolean(scene.properties?.mask);
		const sceneInverse = Boolean(scene.properties?.inverse);
		const enabledDisplayCount = (scene.displays || []).filter(
			(display) => display?.enabled,
		).length;
		const sceneMaskCombine =
			sceneMask && !sceneInverse && enabledDisplayCount > 1 ? "add" : "replace";

		const sceneEffects = (scene.effects || []).filter((e) => e?.enabled);
		const scene2D = [];
		const scene3D = [];
		let scene3DOrder = order; // track first 3D display's order for FBO renderOrder
		let sceneLastOrder = order; // track last display's order for SceneWithEffects renderOrder

		for (const display of scene.displays || []) {
			if (!display?.enabled) {
				continue;
			}

			switch (display.name) {
				case "ImageDisplay": {
					const src = display.properties?.src;
					if (!src || src === BLANK_IMAGE) break;
					scene2D.push(
						<ImageDisplayLayer
							key={display.id}
							display={display}
							order={order}
							sceneOpacity={sceneOpacity}
							sceneBlendMode={sceneBlendMode}
							sceneMask={sceneMask}
							sceneInverse={sceneInverse}
							sceneMaskCombine={sceneMaskCombine}
						/>,
					);
					break;
				}
				case "VideoDisplay":
					scene2D.push(
						<VideoDisplayLayer
							key={display.id}
							display={display}
							order={order}
							sceneOpacity={sceneOpacity}
							sceneBlendMode={sceneBlendMode}
							sceneMask={sceneMask}
							sceneInverse={sceneInverse}
							sceneMaskCombine={sceneMaskCombine}
						/>,
					);
					break;
				case "TextDisplay":
					scene2D.push(
						<TextDisplayLayer
							key={display.id}
							display={display}
							order={order}
							frameData={frameData}
							sceneOpacity={sceneOpacity}
							sceneBlendMode={sceneBlendMode}
							sceneMask={sceneMask}
							sceneInverse={sceneInverse}
							sceneMaskCombine={sceneMaskCombine}
						/>,
					);
					break;
				case "ShapeDisplay":
					scene2D.push(
						<ShapeDisplayLayer
							key={display.id}
							display={display}
							order={order}
							frameData={frameData}
							sceneOpacity={sceneOpacity}
							sceneBlendMode={sceneBlendMode}
							sceneMask={sceneMask}
							sceneInverse={sceneInverse}
							sceneMaskCombine={sceneMaskCombine}
						/>,
					);
					break;
				case "BarSpectrumDisplay":
					scene2D.push(
						<BarSpectrumDisplayLayer
							key={display.id}
							display={display}
							order={order}
							frameData={frameData}
							sceneOpacity={sceneOpacity}
							sceneBlendMode={sceneBlendMode}
							sceneMask={sceneMask}
							sceneInverse={sceneInverse}
							sceneMaskCombine={sceneMaskCombine}
						/>,
					);
					break;
				case "WaveSpectrumDisplay":
					scene2D.push(
						<WaveSpectrumDisplayLayer
							key={display.id}
							display={display}
							order={order}
							frameData={frameData}
							sceneOpacity={sceneOpacity}
							sceneBlendMode={sceneBlendMode}
							sceneMask={sceneMask}
							sceneInverse={sceneInverse}
							sceneMaskCombine={sceneMaskCombine}
						/>,
					);
					break;
				case "SoundWaveDisplay":
					scene2D.push(
						<SoundWaveDisplayLayer
							key={display.id}
							display={display}
							order={order}
							frameData={frameData}
							sceneOpacity={sceneOpacity}
							sceneBlendMode={sceneBlendMode}
							sceneMask={sceneMask}
							sceneInverse={sceneInverse}
							sceneMaskCombine={sceneMaskCombine}
						/>,
					);
					break;
				case "GeometryDisplay":
					if (scene3D.length === 0) scene3DOrder = order;
					scene3D.push(
						<GeometryDisplayLayer3D
							key={display.id}
							display={display}
							order={order}
							frameData={frameData}
							sceneOpacity={sceneOpacity}
							sceneBlendMode={sceneBlendMode}
							sceneMask={sceneMask}
							sceneInverse={sceneInverse}
						/>,
					);
					break;
				default:
					break;
			}
			sceneLastOrder = order;
			order += 1;
		}

		const displayContent = (
			<React.Fragment key={scene.id}>
				{scene3D.length > 0 && (
					<PerspectiveScene3D width={width} height={height} renderOrder={scene3DOrder}>
						{scene3D}
					</PerspectiveScene3D>
				)}
				{scene2D}
			</React.Fragment>
		);

		if (sceneEffects.length > 0) {
			sceneElements.push(
				<SceneWithEffects
					key={scene.id}
					width={width}
					height={height}
					effects={sceneEffects}
					renderOrder={sceneLastOrder}
				>
					{displayContent}
				</SceneWithEffects>,
			);
		} else {
			sceneElements.push(displayContent);
		}
	}

	return (
		<>
			<primitive key="background" attach="background" object={bgColor} />
			{sceneElements}
		</>
	);
}

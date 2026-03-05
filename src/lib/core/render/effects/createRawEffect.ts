// @ts-nocheck
import {
	PPBlurEffect,
	PPColorHalftoneEffect,
	PPDistortionEffect,
	PPGaussianBlurPass,
	PPGlowEffect,
	PPHexPixelateEffect,
	PPKaleidoscopeEffect,
	PPLEDEffect,
	PPMirrorEffect,
	PPRGBShiftEffect,
	PPUnrealBloomPass,
} from "@/lib/postprocessing";
import {
	BlendFunction,
	GlitchMode,
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
import { Vector2 } from "three";
import { toRadians } from "../constants";

export function createRawEffect(effectConfig, width, height) {
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
		case "UnrealBloomEffect":
			return new PPUnrealBloomPass({
				width,
				height,
				exposure: Number(props.exposure ?? 1),
				strength: Number(props.strength ?? 1.5),
				radius: Number(props.radius ?? 0),
				threshold: Number(props.threshold ?? 0),
			});
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
			const blurType = props.type || "Gaussian";
			if (blurType === "Gaussian") {
				return new PPGaussianBlurPass({
					amount: Number(props.amount || 0),
				});
			}
			const blurTypeMap = { Box: 0, Circular: 1, Triangle: 3, Zoom: 4, Lens: 5 };
			return new PPBlurEffect({
				amount: Number(props.amount || 0),
				blurType: blurTypeMap[blurType] ?? 0,
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

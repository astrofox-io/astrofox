// @ts-nocheck
import React from "react";
import { CanvasTexture, LinearFilter } from "three";
import { TexturePlane } from "./TexturePlane";

export function CanvasTextureLayer({
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

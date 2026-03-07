// @ts-nocheck
import React from "react";
import { LinearFilter, SRGBColorSpace, TextureLoader } from "three";
import { TexturePlane } from "./TexturePlane";

export function ImageDisplayLayer({
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
		nextTexture.colorSpace = SRGBColorSpace;
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

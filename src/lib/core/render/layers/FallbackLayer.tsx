// @ts-nocheck
import React from "react";

export function FallbackLayer({ width, height, texture }) {
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

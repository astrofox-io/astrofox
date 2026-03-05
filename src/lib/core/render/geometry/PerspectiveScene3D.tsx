// @ts-nocheck
import React from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import {
	HalfFloatType,
	LinearFilter,
	PerspectiveCamera,
	RGBAFormat,
	Scene as ThreeScene,
	WebGLRenderTarget,
} from "three";

const PERSPECTIVE_FOV = 50;

export function PerspectiveScene3D({ width, height, renderOrder = 0, children }) {
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

// @ts-nocheck
import blendFragmentShader from "@/lib/shaders/glsl/fragment/blend.glsl";
import basicVertexShader from "@/lib/shaders/glsl/vertex/basic.glsl";
import { useFrame, useThree } from "@react-three/fiber";
import React from "react";
import {
	Color,
	HalfFloatType,
	LinearFilter,
	Mesh,
	OrthographicCamera,
	PlaneGeometry,
	RGBAFormat,
	ShaderMaterial,
	Scene as ThreeScene,
	WebGLRenderTarget,
} from "three";

const BLEND_MODES = {
	None: 0,
	Add: 1,
	Average: 2,
	"Color Burn": 3,
	"Color Dodge": 4,
	Darken: 5,
	Difference: 6,
	Exclusion: 7,
	Glow: 8,
	"Hard Light": 9,
	"Hard Mix": 10,
	Lighten: 11,
	"Linear Burn": 12,
	"Linear Dodge": 13,
	"Linear Light": 14,
	Multiply: 15,
	Negation: 16,
	Normal: 17,
	Overlay: 18,
	Phoenix: 19,
	"Pin Light": 20,
	Reflect: 21,
	Screen: 22,
	"Soft Light": 23,
	Subtract: 24,
	"Vivid Light": 25,
	Divide: 26,
};

function createRenderTarget(width, height) {
	return new WebGLRenderTarget(width, height, {
		minFilter: LinearFilter,
		magFilter: LinearFilter,
		format: RGBAFormat,
		type: HalfFloatType,
	});
}

export function SceneComposite({
	width,
	height,
	backgroundColor,
	sceneLayersRef,
	renderOrder = 9999,
}) {
	const gl = useThree((state) => state.gl);
	const compositeScene = React.useMemo(() => new ThreeScene(), []);
	const camera = React.useMemo(() => {
		const cam = new OrthographicCamera(
			-width / 2,
			width / 2,
			height / 2,
			-height / 2,
			-1000,
			1000,
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

	const inputBufferRef = React.useRef(null);
	const outputBufferRef = React.useRef(null);
	if (!inputBufferRef.current) {
		inputBufferRef.current = createRenderTarget(width, height);
	}
	if (!outputBufferRef.current) {
		outputBufferRef.current = createRenderTarget(width, height);
	}

	React.useEffect(() => {
		inputBufferRef.current?.setSize(width, height);
		outputBufferRef.current?.setSize(width, height);
	}, [width, height]);

	React.useEffect(() => {
		return () => {
			inputBufferRef.current?.dispose();
			outputBufferRef.current?.dispose();
		};
	}, []);

	const compositeMaterial = React.useMemo(
		() =>
			new ShaderMaterial({
				uniforms: {
					baseBuffer: { value: null },
					blendBuffer: { value: null },
					mode: { value: BLEND_MODES.Normal },
					alpha: { value: 1 },
					opacity: { value: 1 },
					mask: { value: 0 },
					inverse: { value: 0 },
				},
				vertexShader: basicVertexShader,
				fragmentShader: blendFragmentShader,
				depthTest: false,
				depthWrite: false,
				transparent: true,
			}),
		[],
	);

	const quadGeometryRef = React.useRef(null);
	const quadMeshRef = React.useRef(null);
	if (!quadGeometryRef.current) {
		quadGeometryRef.current = new PlaneGeometry(width, height);
	}
	if (!quadMeshRef.current) {
		quadMeshRef.current = new Mesh(quadGeometryRef.current, compositeMaterial);
	}

	React.useEffect(() => {
		compositeScene.add(quadMeshRef.current);
		return () => {
			compositeScene.remove(quadMeshRef.current);
			quadGeometryRef.current?.dispose();
			compositeMaterial.dispose();
		};
	}, [compositeMaterial, compositeScene]);

	React.useEffect(() => {
		const nextGeometry = new PlaneGeometry(width, height);
		quadMeshRef.current.geometry.dispose();
		quadMeshRef.current.geometry = nextGeometry;
		quadGeometryRef.current = nextGeometry;
	}, [width, height]);

	const finalMaterialRef = React.useRef();
	const tempColor = React.useRef(new Color());

	useFrame(() => {
		const inputBuffer = inputBufferRef.current;
		const outputBuffer = outputBufferRef.current;
		if (!inputBuffer || !outputBuffer) {
			return;
		}

		const prevAutoClear = gl.autoClear;
		gl.autoClear = false;

		gl.getClearColor(tempColor.current);
		const prevClearAlpha = gl.getClearAlpha();

		gl.setClearColor(backgroundColor, 1);
		gl.setRenderTarget(inputBuffer);
		gl.clear();

		const sceneLayers = [...sceneLayersRef.current.values()]
			.filter((layer) => layer?.texture)
			.sort((a, b) => a.order - b.order);

		for (const layer of sceneLayers) {
			const properties = layer.properties || {};
			compositeMaterial.uniforms.baseBuffer.value = inputBuffer.texture;
			compositeMaterial.uniforms.blendBuffer.value = layer.texture;
			compositeMaterial.uniforms.mode.value =
				BLEND_MODES[properties.blendMode] ?? BLEND_MODES.Normal;
			compositeMaterial.uniforms.alpha.value = 1;
			compositeMaterial.uniforms.opacity.value = Number(
				properties.opacity ?? 1,
			);
			compositeMaterial.uniforms.mask.value = properties.mask ? 1 : 0;
			compositeMaterial.uniforms.inverse.value = properties.inverse ? 1 : 0;

			gl.setRenderTarget(outputBuffer);
			gl.clear();
			gl.render(compositeScene, camera);

			const temp = inputBufferRef.current;
			inputBufferRef.current = outputBufferRef.current;
			outputBufferRef.current = temp;
		}

		gl.setRenderTarget(null);
		gl.setClearColor(tempColor.current, prevClearAlpha);
		gl.autoClear = prevAutoClear;

		if (finalMaterialRef.current) {
			finalMaterialRef.current.map = inputBufferRef.current.texture;
		}
	}, 2);

	return (
		<mesh renderOrder={renderOrder}>
			<planeGeometry args={[width, height]} />
			<meshBasicMaterial
				ref={finalMaterialRef}
				transparent={true}
				toneMapped={false}
				depthTest={false}
				depthWrite={false}
			/>
		</mesh>
	);
}

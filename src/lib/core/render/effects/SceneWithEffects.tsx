// @ts-nocheck
import React from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import {
	Color,
	HalfFloatType,
	OrthographicCamera,
	Scene as ThreeScene,
} from "three";
import {
	Effect as RawEffect,
	EffectAttribute,
	EffectPass,
	Pass as RawPass,
} from "postprocessing";
import { PassChain } from "../PassChain";
import { createRawEffect } from "./createRawEffect";

export function SceneWithEffects({ width, height, effects, renderOrder = 0, children }) {
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

	// PassChain — v1-style ping-pong buffer management
	const chainRef = React.useRef(null);

	if (!chainRef.current) {
		chainRef.current = new PassChain(width, height);
	}

	React.useEffect(() => {
		chainRef.current?.setSize(width, height);
	}, [width, height]);

	React.useEffect(() => {
		return () => {
			chainRef.current?.dispose();
		};
	}, []);

	// Rebuild passes when effect list or properties change
	const effectKey = JSON.stringify(effects.map((e) => ({ id: e.id, name: e.name, properties: e.properties })));
	const passesRef = React.useRef([]);
	React.useEffect(() => {
		const rawItems = effects
			.map((e) => {
				try {
					return createRawEffect(e, width, height);
				} catch {
					return null;
				}
			})
			.filter(Boolean);

		// Separate Pass objects (e.g. PPGaussianBlurPass) from Effect objects
		const standalonePasses = rawItems.filter((item) => item instanceof RawPass && !(item instanceof RawEffect));
		const rawEffects = rawItems.filter((item) => item instanceof RawEffect);

		// Build the ordered pass list
		const builtPasses = [...standalonePasses];

		// CONVOLUTION effects cannot be merged into a single EffectPass — each
		// needs its own pass. Non-convolution effects can share one EffectPass.
		const convolutionEffects = rawEffects.filter(
			(e) => (e.getAttributes() & EffectAttribute.CONVOLUTION) !== 0,
		);
		const otherEffects = rawEffects.filter(
			(e) => (e.getAttributes() & EffectAttribute.CONVOLUTION) === 0,
		);

		for (const effect of convolutionEffects) {
			try {
				builtPasses.push(new EffectPass(camera, effect));
			} catch {
				// Effect pass failed to compile, skip
			}
		}
		if (otherEffects.length > 0) {
			try {
				builtPasses.push(new EffectPass(camera, ...otherEffects));
			} catch {
				// Effect pass failed to compile, skip effects
			}
		}

		// Initialize all passes (matching what EffectComposer.addPass does)
		const alpha = gl.getContext().getContextAttributes()?.alpha ?? false;
		for (const pass of builtPasses) {
			try {
				pass.setSize(width, height);
				pass.initialize(gl, alpha, HalfFloatType);
			} catch {
				// Ignore initialization errors
			}
		}

		passesRef.current = builtPasses;
	}, [effectKey, camera, gl, width, height]);

	const tempColor = React.useRef(new Color());
	const meshRef = React.useRef();

	useFrame((_, delta) => {
		const chain = chainRef.current;
		if (!chain) return;

		// Disable autoClear — EffectComposer used to do this as a side effect
		// of setRenderer(). Without it, gl.render() auto-clears our manually
		// cleared opaque-black buffer with the canvas clear color (alpha=0).
		const prevAutoClear = gl.autoClear;
		gl.autoClear = false;

		// Step 1: Render scene content directly to chain's inputBuffer
		// Clear with opaque black (matching v1 behavior — effects process on opaque background)
		gl.getClearColor(tempColor.current);
		const prevClearAlpha = gl.getClearAlpha();
		gl.setClearColor(0x000000, 1);
		gl.setRenderTarget(chain.inputBuffer);
		gl.clear();
		gl.setClearColor(tempColor.current, prevClearAlpha);
		gl.render(sceneObj, camera);

		// Step 2: Run PassChain when effects are available.
		// If there are no passes (e.g. while toggling/rebuilding), keep a passthrough
		// frame in inputBuffer so the output plane never falls back to white.
		if (passesRef.current.length > 0) {
			chain.render(gl, passesRef.current, delta);
		}

		gl.setRenderTarget(null);
		gl.autoClear = prevAutoClear;

		// Step 3: Update output mesh with composited result
		if (meshRef.current) {
			meshRef.current.material.map = chain.inputBuffer.texture;
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

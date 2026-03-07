// @ts-nocheck
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import {
	EffectAttribute,
	EffectPass,
	Effect as RawEffect,
	Pass as RawPass,
} from "postprocessing";
import React from "react";
import {
	Color,
	HalfFloatType,
	OrthographicCamera,
	Scene as ThreeScene,
} from "three";
import { PassChain } from "../PassChain";
import { createRawEffect } from "./createRawEffect";
import { createScenePass } from "./createScenePass";

export function SceneWithEffects({
	width,
	height,
	effects,
	frameData,
	renderOrder = 0,
	onTexture,
	outputToScreen = true,
	children,
}) {
	const gl = useThree((state) => state.gl);
	const onTextureRef = React.useRef(onTexture);

	React.useEffect(() => {
		onTextureRef.current = onTexture;
	}, [onTexture]);

	// Portal scene for children (2D + 3D displays)
	const sceneObj = React.useMemo(() => new ThreeScene(), []);
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

	React.useEffect(() => {
		return () => {
			onTextureRef.current?.(null);
		};
	}, []);

	// Rebuild passes when effect list or properties change
	const effectKey = JSON.stringify(
		effects.map((e) => ({ id: e.id, name: e.name, properties: e.properties })),
	);
	const passesRef = React.useRef([]);
	const rawEffectsRef = React.useRef([]);
	React.useEffect(() => {
		const builtPasses = [];
		const rawEffects = [];

		for (const effect of effects) {
			let item = null;

			try {
				item = createScenePass(effect, width, height);
			} catch {
				item = null;
			}

			if (item) {
				builtPasses.push(item);
				continue;
			}

			try {
				item = createRawEffect(effect, width, height);
			} catch {
				item = null;
			}

			if (!item) {
				continue;
			}

			if (item instanceof RawPass && !(item instanceof RawEffect)) {
				builtPasses.push(item);
				continue;
			}

			if (item instanceof RawEffect) {
				rawEffects.push(item);
			}
		}

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
				pass.setSize?.(width, height);
				pass.initialize?.(gl, alpha, HalfFloatType);
			} catch {
				// Ignore initialization errors
			}
		}

		const previousPasses = passesRef.current;
		passesRef.current = builtPasses;
		rawEffectsRef.current = rawEffects;
		for (const pass of previousPasses) {
			if (!builtPasses.includes(pass)) {
				try {
					pass.dispose?.();
				} catch {
					// Ignore dispose errors
				}
			}
		}
	}, [effectKey, camera, gl, width, height]);

	const tempColor = React.useRef(new Color());
	const meshRef = React.useRef();

	useFrame((_, delta) => {
		const chain = chainRef.current;
		if (!chain) return;

		for (const pass of passesRef.current) {
			try {
				pass.__updateScenePass?.(frameData);
			} catch {
				// Ignore live uniform update errors and continue rendering.
			}
		}
		for (const effect of rawEffectsRef.current) {
			try {
				effect.__updateRawEffect?.(frameData);
			} catch {
				// Ignore live raw effect update errors and continue rendering.
			}
		}

		// Disable autoClear — EffectComposer used to do this as a side effect
		// of setRenderer(). Without it, gl.render() auto-clears our manually
		// cleared opaque-black buffer with the canvas clear color (alpha=0).
		const prevAutoClear = gl.autoClear;
		gl.autoClear = false;

		// Step 1: Render scene content directly to chain's inputBuffer
		// Clear to transparent black so the composed scene can blend with scenes below it.
		gl.getClearColor(tempColor.current);
		const prevClearAlpha = gl.getClearAlpha();
		gl.setClearColor(0x000000, 0);
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
		onTextureRef.current?.(chain.inputBuffer.texture);

		if (outputToScreen && meshRef.current) {
			const material = meshRef.current.material;
			if (material.map !== chain.inputBuffer.texture) {
				material.map = chain.inputBuffer.texture;
				material.needsUpdate = true;
			}
		}
	}, -1);

	return (
		<>
			{createPortal(children, sceneObj)}
			{outputToScreen ? (
				<mesh ref={meshRef} renderOrder={renderOrder}>
					<planeGeometry args={[width, height]} />
					<meshBasicMaterial
						transparent={true}
						premultipliedAlpha={true}
						toneMapped={false}
						depthTest={false}
						depthWrite={false}
					/>
				</mesh>
			) : null}
		</>
	);
}

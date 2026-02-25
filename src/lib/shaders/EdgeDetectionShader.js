import fragmentShader from "@/lib/shaders/glsl/fragment/edge-detection.glsl";
import vertexShader from "@/lib/shaders/glsl/vertex/basic.glsl";
import { Color, Vector2, Vector3 } from "three";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		resolution: { type: "v2", value: new Vector2(1, 1) },
		thickness: { type: "f", value: 1.0 },
		neon: { type: "i", value: 0 },
		edgeColor: { type: "v3", value: new Vector3(1, 1, 1) },
	},
	vertexShader,
	fragmentShader,
};

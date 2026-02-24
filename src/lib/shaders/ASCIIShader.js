import fragmentShader from "@/lib/shaders/glsl/fragment/ascii.glsl";
import vertexShader from "@/lib/shaders/glsl/vertex/basic.glsl";
import { Vector2 } from "three";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		resolution: { type: "v2", value: new Vector2(1, 1) },
		charSize: { type: "f", value: 8.0 },
		colored: { type: "i", value: 1 },
	},
	vertexShader,
	fragmentShader,
};

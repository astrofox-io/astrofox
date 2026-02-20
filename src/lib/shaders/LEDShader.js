import fragmentShader from "@/lib/shaders/glsl/fragment/led.glsl";
import vertexShader from "@/lib/shaders/glsl/vertex/basic.glsl";
import { Vector2 } from "three";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		spacing: { type: "f", value: 10.0 },
		size: { type: "f", value: 4.0 },
		blur: { type: "f", value: 4.0 },
		resolution: { type: "v2", value: new Vector2(1, 1) },
	},
	vertexShader,
	fragmentShader,
};

import fragmentShader from "@/shaders/glsl/fragment/zoom-blur.glsl";
import vertexShader from "@/shaders/glsl/vertex/basic.glsl";
import { Vector2 } from "three";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		center: { type: "v2", value: new Vector2(0.5, 0.5) },
		amount: { type: "f", value: 1.0 },
		resolution: { type: "v2", value: new Vector2(1, 1) },
	},
	vertexShader,
	fragmentShader,
};

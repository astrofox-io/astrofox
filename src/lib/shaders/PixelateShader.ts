import fragmentShader from "@/lib/shaders/glsl/fragment/pixelate.glsl";
import vertexShader from "@/lib/shaders/glsl/vertex/basic.glsl";
import { Vector2 } from "three";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		size: { type: "f", value: 10 },
		resolution: { type: "v2", value: new Vector2(1, 1) },
	},
	vertexShader,
	fragmentShader,
};

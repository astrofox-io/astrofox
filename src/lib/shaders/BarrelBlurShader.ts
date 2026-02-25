import fragmentShader from "@/lib/shaders/glsl/fragment/barrel-blur.glsl";
import vertexShader from "@/lib/shaders/glsl/vertex/basic.glsl";
import { Vector2 } from "three";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		resolution: { type: "v2", value: new Vector2(1, 1) },
	},
	vertexShader,
	fragmentShader,
};

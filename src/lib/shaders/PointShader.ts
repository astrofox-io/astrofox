import fragmentShader from "@/lib/shaders/glsl/fragment/point.glsl";
import vertexShader from "@/lib/shaders/glsl/vertex/point.glsl";
import { Color } from "three";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		opacity: { type: "f", value: 1.0 },
		color: { type: "c", value: new Color(0xffffff) },
	},
	vertexShader,
	fragmentShader,
	alphaTest: 0.9,
};

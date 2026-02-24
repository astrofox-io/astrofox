import fragmentShader from "@/lib/shaders/glsl/fragment/vhs.glsl";
import vertexShader from "@/lib/shaders/glsl/vertex/basic.glsl";
import { Vector2 } from "three";

export default {
	uniforms: {
		inputTexture: { type: "t", value: null },
		time: { type: "f", value: 0.0 },
		intensity: { type: "f", value: 0.5 },
		speed: { type: "f", value: 0.5 },
		resolution: { type: "v2", value: new Vector2(1, 1) },
	},
	vertexShader,
	fragmentShader,
};

import Display from "@/lib/core/Display";

export default class WebGLDisplay extends Display {
	constructor(info, properties) {
		super(info, properties);

		this.type = "webgl";
	}
}

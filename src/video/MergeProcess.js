import Process from "core/Process";

export default class MergeProcess extends Process {
	start({ inputFiles, outputFile }) {
		return new Promise((resolve, reject) => {
			const inputs = inputFiles.flatMap((file) => ["-i", file]);

			this.on("close", (code) => {
				if (code !== 0) {
					reject(new Error("Process terminated."));
				}
				resolve();
			});

			this.on("error", (err) => {
				reject(err);
			});

			this.on("stderr", (data) => {
				this.emit("output", data);
			});

			super.start([
				"-y",
				...inputs,
				"-codec",
				"copy",
				"-shortest",
				"-movflags",
				"+faststart",
				outputFile,
			]);
		});
	}
}

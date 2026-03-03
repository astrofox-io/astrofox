import EventEmitter from "@/lib/core/EventEmitter";
import { api, logger } from "@/lib/view/global";

export default class Process extends EventEmitter {
	command: string;
	stop: (() => void) | null = null;
	push: ((...args: unknown[]) => void) | null = null;
	end: (() => void) | null = null;

	constructor(command: string) {
		super();

		this.command = command;
	}

	start(args?: string[]) {
		logger.log("Starting process:", this.command, (args || []).join(" "));

		const handlers = {
			onStdOut: (data: unknown) => {
				this.emit("stdout", data);
			},
			onStdErr: (data: unknown) => {
				this.emit("stderr", data);
			},
			onClose: (code: unknown, signal: unknown) => {
				logger.log("Process ended with code", code, "and signal", signal);

				this.emit("close", code, signal);
			},
			onExit: (code: unknown, signal: unknown) => {
				this.emit("exit", code, signal);
			},
			onError: (err: unknown) => {
				this.emit("error", err);
			},
		};

		// Spawn process (signature differs at runtime in Electron builds)
		const spawnFn = api.spawnProcess as unknown as (
			command: string,
			args: string[] | undefined,
			handlers: Record<string, (...cbArgs: unknown[]) => void>,
		) => {
			stop: () => void;
			push: (...pushArgs: unknown[]) => void;
			end: () => void;
		};
		const { stop, push, end } = spawnFn(this.command, args, handlers);

		this.stop = stop;
		this.push = push;
		this.end = end;

		this.emit("start");

		return null;
	}
}

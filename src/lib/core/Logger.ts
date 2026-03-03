/* eslint-disable no-console */
const LABEL_CSS = "color:indigo;background-color:lavender;font-weight:bold;";
const TIMER_CSS = "color:green;background-color:honeydew;";

export default class Logger {
	name: string;
	timers: Record<string, number> = {};

	constructor(name: string) {
		this.name = name;
	}

	output(method: (...args: unknown[]) => void, args: unknown[]) {
		const label: unknown[] = ["%c%s%c", LABEL_CSS, this.name, "color:black"];

		// If format specifiers are defined, merge with label
		if (
			args.length &&
			typeof args[0] === "string" &&
			/%[sidfoOc]/.test(args[0])
		) {
			label[0] = `${label[0]} ${args[0]}`;

			args = args.slice(1);
		}

		method.apply(console, label.concat(args));
	}

	log(...args: unknown[]) {
		this.output(console.log, args);
	}

	info(...args: unknown[]) {
		this.output(console.info, args);
	}

	warn(...args: unknown[]) {
		this.output(console.warn, args);
	}

	error(...args: unknown[]) {
		this.output(console.error, args);
	}

	trace(...args: unknown[]) {
		this.output(console.trace, args);
	}

	debug(...args: unknown[]) {
		if (process.env.NODE_ENV !== "production") {
			this.output(console.log, args);
		}
	}

	time(id: string) {
		this.timers[id] = window.performance.now();
	}

	timeEnd(id: string, ...args: unknown[]) {
		const timer = this.timers[id];

		if (timer) {
			const t = (window.performance.now() - timer) / 1000;
			const val = t < 1 ? `${~~(t * 1000)}ms` : `${t.toFixed(2)}s`;

			this.output(
				console.log,
				(["%c+%s", TIMER_CSS, val] as unknown[]).concat(args),
			);
		}
	}
}

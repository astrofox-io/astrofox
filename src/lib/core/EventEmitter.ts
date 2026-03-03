import type { EventCallback } from "@/lib/types";

export default class EventEmitter {
	events: Record<string, EventCallback[]> = {};

	on(event: string, fn: EventCallback): number {
		this.events[event] = this.events[event] || [];

		return this.events[event].push(fn);
	}

	once(event: string, fn: EventCallback): void {
		const wrapper: EventCallback = (...args: unknown[]) => {
			this.off(event, wrapper);
			fn(...args);
		};
		this.on(event, wrapper);
	}

	off(event: string, fn: EventCallback): void {
		if (!this.events[event]) return;

		const events = this.events[event];

		this.events[event] = events.filter((e) => e !== fn);
	}

	emit(...args: unknown[]): void {
		const event = args.shift() as string;
		const events = this.events[event] || [];

		events.forEach((fn) => fn(...args));
	}
}

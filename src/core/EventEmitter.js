export default class EventEmitter {
	on(event, fn) {
		this.events = this.events || {};
		this.events[event] = this.events[event] || [];

		return this.events[event].push(fn);
	}

	off(event, fn) {
		if (!this.events || !this.events[event]) return;

		const events = this.events[event];

		this.events[event] = events.filter((e) => e !== fn);
	}

	emit(...args) {
		this.events = this.events || {};

		const event = args.shift();
		const events = this.events[event] || [];

		events.forEach((fn) => fn(...args));
	}
}

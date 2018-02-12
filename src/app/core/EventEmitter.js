export default class EventEmitter {
    on(event, fn, context) {
        this.events = this.events || {};
        this.events[event] = this.events[event] || [];

        return this.events[event].push({ fn, context });
    }

    off(event, fn) {
        if (!this.events || !this.events[event]) return;

        const events = this.events[event];
        let i = events.length - 1;

        if (fn) {
            while (i > 0) {
                if (fn === events[i].fn) {
                    events.splice(i, 1);
                }
                i -= 1;
            }
        }
        else {
            while (events.length > 0) events.pop();
        }
    }

    once(event, fn, context, ...args) {
        const c = () => {
            this.off(event, c);
            return fn.apply(context, args);
        };
        return this.on(event, c, this);
    }

    emit(...args) {
        this.events = this.events || {};

        const event = args.shift();
        const events = this.events[event] || [];

        events.forEach((e) => {
            e.fn.apply(e.context, args);
        });
    }
}

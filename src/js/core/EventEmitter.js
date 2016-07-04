'use strict';

class EventEmitter {
    on(event, fn, context) {
        this.events = this.events || {};
        this.events[event] = this.events[event] || [];

        return this.events[event].push({fn: fn, context: context});
    }

    off(event, fn) {
        if (!this.events || !this.events[event]) return;

        let events = this.events[event],
            i = events.length;

        if (fn) {
            while (i-- > 0) {
                if (fn == events[i].fn) {
                    events.splice(i, 1);
                }
            }
        }
        else {
            while (events.length > 0) events.pop();
        }
    }

    once(event, fn, context) {
        let _fn;
        return this.on(event, _fn = () => {
            this.off(event, _fn);
            return fn.apply(context, arguments);
        }, this);
    }

    emit() {
        this.events = this.events || {};

        let args = Array.apply([], arguments),
            event = args.shift(),
            events = this.events[event] || [];

        events.forEach(e => {
            e.fn.apply(e.context, args);
        });
    }
}

module.exports = EventEmitter;
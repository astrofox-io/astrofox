/* eslint-disable no-console */
export default class Logger {
    constructor(name) {
        this.name = name;
        this.timers = {};
    }
    
    output(method, args) {
        if (process.env.NODE_ENV !== 'production') {
            let label = ['%c%s%c', 'color:indigo;font-weight:bold;', this.name, 'color:black'];

            // Convert to array
            if (!Array.isArray(args)) {
                args = Array.prototype.slice.call(args);
            }

            // If colors are defined, merge with label
            if (args.length && typeof args[0] === 'string' && args[0].indexOf('%c') >= 0) {
                label[0] += ' ' + args[0];
                args = args.slice(1);
            }

            method.apply(console, label.concat(args));
        }
    }

    log() {
        if (process.env.NODE_ENV !== 'production') {
            this.output(console.log, arguments);
        }
    }

    info() {
        if (process.env.NODE_ENV !== 'production') {
            this.output(console.info, arguments);
        }
    }

    warn() {
        if (process.env.NODE_ENV !== 'production') {
            this.output(console.warn, arguments);
        }
    }

    error() {
        if (process.env.NODE_ENV !== 'production') {
            this.output(console.error, arguments);
        }
    }

    trace() {
        if (process.env.NODE_ENV !== 'production') {
            this.output(console.trace, arguments);
        }
    }

    timeStart(id, msg) {
        if (process.env.NODE_ENV !== 'production') {
            this.timers[id] = window.performance.now();
            if (msg) this.log(msg);
        }
    }

    timeEnd(id, msg) {
        if (process.env.NODE_ENV !== 'production') {
            let timer = this.timers[id];
            if (timer) {
                let t = (window.performance.now() - timer) / 1000,
                    val = (t < 1) ? ~~(t*1000) : t.toFixed(2),
                    ms = (t < 1) ? 'ms' : 'sec';

                this.output(console.log, ['%s %c+%s', msg, 'color:green;', val + ms]);

                return t;
            }
        }
    }
}
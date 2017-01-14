/* eslint-disable no-console */
'use strict';

class Logger {
    constructor() {
        this.timers = {};
    }

    log() {
        if (process.env.NODE_ENV === 'development') {
            console.log.apply(console, arguments);
        }
    }

    info() {
        if (process.env.NODE_ENV === 'development') {
            console.info.apply(console, arguments);
        }
    }

    warn() {
        if (process.env.NODE_ENV === 'development') {
            console.warn.apply(console, arguments);
        }
    }

    error() {
        if (process.env.NODE_ENV === 'development') {
            console.error.apply(console, arguments);
        }
    }

    trace() {
        if (process.env.NODE_ENV === 'development') {
            console.trace.apply(console, arguments);
        }
    }

    timeStart(id, msg) {
        if (process.env.NODE_ENV === 'development') {
            this.timers[id] = window.performance.now();
            if (msg) console.log(msg);
        }
    }

    timeEnd(id, msg) {
        if (process.env.NODE_ENV === 'development') {
            let timer = this.timers[id];
            if (timer) {
                let t = (window.performance.now() - timer) / 1000;

                console.log('%c%s %s:', 'color: blue;', (t < 1) ? ~~(t*1000) : t.toFixed(2), (t < 1) ? 'ms' : 'sec', msg);

                return t;
            }
        }
    }
}

module.exports = Logger;
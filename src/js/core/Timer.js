'use strict';

class Timer {
    constructor() {
        this.timers = {};
    }

    set(id) {
        this.timers[id] = window.performance.now();
    }

    get(id) {
        let timer = this.timers[id];
        if (timer) {
            return (window.performance.now() - timer) / 1000;
        }
        return 0;
    }
}

module.exports = Timer;
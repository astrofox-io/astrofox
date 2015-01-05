var Timer = function() {
    this.timers = {};
};

Timer.prototype.set = function(id) {
    this.timers[id] = performance.now();
};

Timer.prototype.get = function(id) {
    var timer = this.timers[id];
    if (timer) {
        return (performance.now() - timer) / 1000;
    }
    return 0;
};

module.exports = Timer;
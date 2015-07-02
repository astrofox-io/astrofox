'use strict';

var EventEmitter = function(){};

EventEmitter.prototype = {
    on: function(event, fn, context) {
        this.events = this.events || {};
        this.events[event] = this.events[event] || [];

        return this.events[event].push({fn: fn, context: context});
    },

    off: function(event, fn) {
        if (!this.events || !this.events[event]) return;

        var events = this.events[event],
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
    },

    once: function(event, fn, context) {
        var _fn;
        return this.on(event, _fn = function() {
            this.off(event, _fn);
            return fn.apply(context, arguments);
        }, this);
    },

    emit: function() {
        this.events = this.events || {};

        var args = Array.apply([], arguments),
            event = args.shift(),
            events = this.events[event] || [];

        events.forEach(function(e) {
            e.fn.apply(e.context, args);
        });
    }
};

module.exports = EventEmitter;

'use strict';

var Immutable = require('immutable');

var Scene = function() {
    this.displays = new Immutable.List();
};

Scene.prototype = {
    constructor: Scene,

    addDisplay: function(display, index) {
        var displays = this.displays;

        this.displays = (typeof index !== 'undefined') ?
            displays.unshift(display) :
            displays.push(display);

        if (display.addToScene) {
            display.addToScene(this.stage);
        }
    },

    removeDisplay: function(display) {
        var displays = this.displays,
            index = displays.indexOf(display);

        if (index > -1) {
            this.displays = displays.delete(index);

            if (display.removeFromScene) {
                display.removeFromScene(this.stage);
            }
        }
    },

    swapDisplay: function(index, newIndex) {
        var displays = this.displays;

        if (index > -1 && index < displays.size) {
            this.displays = displays.withMutations(function(list) {
                var tmp = list.get(index);
                list.set(index, list.get(newIndex));
                list.set(newIndex, tmp);
            });
        }
    },

};

module.exports = Scene;
'use strict';

var EventEmitter = require('../core/EventEmitter.js');
var _ = require('lodash');

var RenderManager = EventEmitter.extend({
    constructor: function(canvas, options) {
        this.canvas = canvas;
        this.fps = 0;
        this.time = 0;
        this.frame = 0;
        this.controls = [];
        this.init(options);
    }
});

RenderManager.prototype.init = function(options) {
    this.options = _.assign({}, options);
};

RenderManager.prototype.registerControl = function(control) {
    this.controls.push(control);
};

RenderManager.prototype.unregisterControl = function(control) {
    var index = this.controls.indexOf(control);
    if (index > -1) {
        this.controls.splice(index, 1);
    }
};

RenderManager.prototype.updateFPS = function() {
    var now = performance.now();

    if (!this.time) {
        this.time = now;
        this.fps = 0;
        this.frame = 0;
        return;
    }

    var delta = (now - this.time) / 1000;

    // Only update every second
    if (delta > 1) {
        this.fps = Math.ceil(this.frame / delta);
        this.time = now;
        this.frame = 0;
    }
    else {
        this.frame += 1;
    }
};

RenderManager.prototype.getFPS = function() {
    return this.fps;
};

RenderManager.prototype.render = function() {
    _(this.controls).forEachRight(function(c) {
        if (c.renderScene) c.renderScene(this.canvas, this.frame);
    }.bind(this));

    this.updateFPS();
};

module.exports = RenderManager;
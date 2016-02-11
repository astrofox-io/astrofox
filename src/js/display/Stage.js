'use strict';

var _ = require('lodash');
var THREE = require('three');
var EventEmitter = require('../core/EventEmitter.js');
var NodeCollection = require('../core/NodeCollection.js');
var Composer = require('../graphics/Composer.js');
var IO = require('../IO.js');

var defaults = {
    showFPS: false,
    audioOutput: 'mux',
    videoOutput: 'mp4',
    width: 854,
    height: 480
};

var Stage = function(options) {
    this.stats = {
        fps: 0,
        ms: 0,
        time: 0,
        frames: 0,
        stack: []
    };
    
    this.scenes = new NodeCollection();

    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    this.options = _.assign({}, defaults);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, premultipliedAlpha: true, alpha: false });
    this.renderer.setSize(854, 480);
    this.renderer.autoClear = false;

    this.composer = new Composer(this.renderer);

    this.update(options);
};

Stage.prototype = _.create(NodeCollection.prototype, {
    constructor: Stage,

    update: function(options) {
        if (typeof options === 'object') {
            for (var prop in options) {
                if (hasOwnProperty.call(this.options, prop)) {
                    this.options[prop] = options[prop];
                }
            }
        }
    },

    addScene: function(scene) {
        this.scenes.addNode(scene);

        scene.addToStage(this);
    },

    removeScene: function(scene) {
        this.scenes.removeNode(scene);

        scene.removeFromStage(this);
    },

    shiftScene(scene, i) {
        var index = this.scenes.indexOf(scene);

        this.scenes.swapNodes(index, index + i);
    },

    getScenes: function() {
        return this.scenes.nodes;
    },

    clearScenes: function() {
        this.scenes.nodes.forEach(function(scene) {
            this.removeScene(scene);
        }.bind(this));
    },

    hasScenes: function() {
        return this.scenes.nodes.size > 0;
    },

    renderFrame: function(data, callback) {
        var options,
            composer = this.composer,
            buffer = null;

        this.renderer.clear();

        composer.clearBuffer(true, true, true);

        this.scenes.nodes.forEach(function(scene, index) {
            if (scene.options.enabled) {
                buffer = scene.render(data);
                options = _.assign({}, scene.options);

                if (index == 0) {
                    options.blendMode = 'Normal';
                }

                composer.blendBuffer(buffer, options);
            }
        }, this);

        composer.renderToScreen();

        this.updateFPS();

        if (callback) callback();
    },

    getSize: function() {
        var canvas =  this.renderer.domElement;

        return {
            width: canvas.width,
            height: canvas.height
        };
    },

    getImage: function(callback, format) {
        var img = this.renderer.domElement.toDataURL(format || 'image/png'),
            base64 = img.replace(/^data:image\/\w+;base64,/, ''),
            buffer = new IO.Buffer(base64, 'base64');

        if (callback) callback(buffer);
    },

    updateFPS: function() {
        var now = performance.now(),
            stats = this.stats;

        if (!stats.time) {
            stats.time = now;
        }

        stats.frames += 1;

        if (now > stats.time + 1000) {
            stats.fps = Math.round((stats.frames * 1000) / (now - stats.time));
            stats.ms = (now - stats.time) / stats.frames;
            stats.time = now;
            stats.frames = 0;

            stats.stack.push(stats.fps);

            if (stats.stack.length > 10) {
                stats.stack.shift();
            }

            this.emit('tick', stats);
        }
    },

    toJSON: function() {
        var scenes = this.scenes.map(function(scene) {
            return scene.toJSON();
        });

        return {
            scenes: scenes,
            options: this.options
        };
    }
});

module.exports = Stage;

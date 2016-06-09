'use strict';

var _ = require('lodash');
var THREE = require('three');
var IO = require('../IO.js');
var EventEmitter = require('../core/EventEmitter.js');
var NodeCollection = require('../core/NodeCollection.js');
var Composer = require('../graphics/Composer.js');
var FrameBuffer = require('../graphics/FrameBuffer.js');

var Stage = function() {
    this.scenes = new NodeCollection();

    this.renderer = new THREE.WebGLRenderer({ antialias: false, premultipliedAlpha: true, alpha: false });
    this.renderer.setSize(854, 480);
    this.renderer.autoClear = false;

    this.composer = new Composer(this.renderer);

    this.buffer2D = new FrameBuffer('2d');
    this.buffer3D = new FrameBuffer('webgl');
};

Stage.prototype = _.create(NodeCollection.prototype, {
    constructor: Stage,

    addScene: function(scene) {
        this.scenes.addNode(scene);

        scene.owner = this;

        scene.addToStage(this);
    },

    removeScene: function(scene) {
        this.scenes.removeNode(scene);

        scene.owner = null;

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

    getSize: function() {
        var canvas =  this.renderer.domElement;

        return {
            width: canvas.width,
            height: canvas.height
        };
    },

    getImage: function(callback, format) {
        var img = this.renderer.domElement.toDataURL(format || 'image/png');
        var base64 = img.replace(/^data:image\/\w+;base64,/, '');
        var buffer = new IO.Buffer(base64, 'base64');

        if (callback) callback(buffer);
    },

    toJSON: function() {
        var scenes = this.scenes.map(function(scene) {
            return scene.toJSON();
        });

        return {
            scenes: scenes,
            options: this.options
        };
    },

    renderFrame: function(data, callback) {
        var options, buffer,
            composer = this.composer;

        composer.clearScreen(true, true, true);
        composer.clearBuffer(true, true, true);

        this.scenes.nodes.forEach(function(scene, index) {
            if (scene.options.enabled) {
                buffer = scene.render(data);
                options = _.assign({}, scene.options);

                if (index === 0) {
                    options.blendMode = 'None';
                }

                composer.blendBuffer(buffer, options);
            }
        }, this);

        composer.renderToScreen();

        if (callback) callback();
    }
});

module.exports = Stage;

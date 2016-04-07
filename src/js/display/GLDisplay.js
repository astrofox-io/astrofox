'use strict';

var _ = require('lodash');
var THREE = require('three');
var Display = require('../display/Display.js');
var TexturePass = require('../graphics/TexturePass.js');

var GLDisplay = function(name, options) {
    Display.call(this, name, options);

    this.canvas = document.createElement('canvas');

    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });

    this.texture = new THREE.Texture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;

    this.pass = new TexturePass(this.texture);
};

GLDisplay.prototype = _.create(Display.prototype, {
    constructor: GLDisplay,

    renderToCanvas: function(scene) {

    }
});

module.exports = GLDisplay;
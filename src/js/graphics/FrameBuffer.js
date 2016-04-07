'use strict';

var _ = require('lodash');
var THREE = require('three');
var TexturePass = require('../graphics/TexturePass.js');

var defaults = {
    width: 854,
    height: 480
};

var FrameBuffer = function(type, options) {
    this.options = _.assign({}, defaults, options);

    this.canvas = document.createElement('canvas');
    this.setSize(this.options.width, this.options.height);
    
    this.renderer = null;

    if (type === 'webgl') {
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, canvas: this.canvas});
        this.renderer.autoClear = false;
    }
    else {
        this.context = this.canvas.getContext('2d');
    }

    this.texture = new THREE.Texture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;

    this.pass = new TexturePass(this.texture);
};

FrameBuffer.prototype = {
    setSize: function(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    },

    clear: function() {
        var renderer = this.renderer,
            context = this.context,
            canvas = this.canvas;

        if (renderer) {
            renderer.clear();
        }
        else {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    },
    
    render: function(scene, camera) {
        this.renderer.render(scene, camera);
    }
};

module.exports = FrameBuffer;
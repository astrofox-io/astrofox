'use strict';

const THREE = require('three');
const TexturePass = require('../graphics/TexturePass.js');

const defaults = {
    width: 854,
    height: 480
};

class FrameBuffer {
    constructor(type, options) {
        this.options = Object.assign({}, defaults, options);
    
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
    }
    
    setSize(width, height) {
        let renderer = this.renderer,
            canvas = this.canvas;

        if (renderer) {
            renderer.setScissor(width, height);
        }
        else {
            canvas.width = width;
            canvas.height = height;
        }
    }

    clear() {
        let renderer = this.renderer,
            context = this.context,
            canvas = this.canvas;

        if (renderer) {
            renderer.clear();
        }
        else {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    render(scene, camera) {
        this.renderer.render(scene, camera);
    }
}

module.exports = FrameBuffer;
'use strict';

var EventEmitter = require('../core/EventEmitter.js');
var _ = require('lodash');
var THREE = require('three');

var RenderManager = EventEmitter.extend({
    constructor: function(canvas2d, canvas3d, options) {
        this.canvas2d = canvas2d;
        this.canvas3d = canvas3d;
        this.fps = 0;
        this.time = 0;
        this.frame = 0;
        this.frameCount = 0;
        this.controls = [];

        this.init(options);
        this.setup();
    }
});

RenderManager.prototype.init = function(options) {
    this.options = _.assign({}, options);
};

RenderManager.prototype.setup = function() {
    var width = this.canvas3d.width,
        height = this.canvas3d.height,
        factor = 2;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas3d });
    this.renderer.setSize(width, height);
    this.renderer.autoClear = false;

    // Scene 2D
    this.scene2d = new THREE.Scene();
    this.camera2d = new THREE.OrthographicCamera(-1 * width / factor, width / factor, height / factor, -1 * height / factor, 1, 10);
    this.camera2d.position.z = 10;

    this.texture2d = new THREE.Texture(this.canvas2d);
    this.texture2d.needsUpdate = true;

    var material = new THREE.SpriteMaterial({
        map: this.texture2d,
        transparent: true
    });

    var sprite = new THREE.Sprite(material);
    sprite.scale.set(material.map.image.width, material.map.image.height, 1);
    sprite.position.set(0, 0, 1);

    this.scene2d.add(sprite);

    // Scene 3D
    this.scene3d = new THREE.Scene();
    this.camera3d = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    this.scene3d.add(this.camera3d);

    /*
    // light
    var pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;
    this.scene3d.add(pointLight);

    // cube
    var geometry = new THREE.BoxGeometry(1,1,1);
    var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
    this.cube = new THREE.Mesh( geometry, material );
    this.cube.position.z = -10;
    this.scene3d.add(this.cube);
    */
};

RenderManager.prototype.registerControl = function(control) {
    this.controls.push(control);
};

RenderManager.prototype.unregisterControl = function(control) {
    var index = this.controls.indexOf(control);
    if (index > -1) {
        //this.controls.splice(index, 1);
        spliceOne(this.controls, index);
    }
};

RenderManager.prototype.getFrame = function() {
    return this.frame;
};

RenderManager.prototype.updateFPS = function() {
    var now = performance.now();

    if (!this.time) {
        this.time = now;
        this.fps = 0;
        this.frameCount = 0;
        return;
    }

    var delta = (now - this.time) / 1000;

    // Only update every second
    if (delta > 1) {
        this.fps = Math.ceil(this.frame / delta);
        this.time = now;
        this.frameCount = 0;
    }
    else {
        this.frameCount += 1;
    }
};

RenderManager.prototype.getFPS = function() {
    return this.fps;
};

RenderManager.prototype.clear = function() {

};

RenderManager.prototype.render = function(save) {
    this.canvas2d.getContext('2d').clearRect(0, 0, this.canvas2d.width, this.canvas2d.height);

    _(this.controls).forEachRight(function(control) {
        if (control.renderScene) {
            control.renderScene(
                (control.config.context == '3d') ? this.canvas3d : this.canvas2d,
                this.frame
            );
        }
    }.bind(this));

    this.texture2d.needsUpdate = true;

    //this.cube.rotation.x += 0.1;
    //this.cube.rotation.y += 0.1;

    this.renderer.clear();
    this.renderer.render(this.scene3d, this.camera3d);
    this.renderer.clearDepth();
    this.renderer.render(this.scene2d, this.camera2d);

    this.updateFPS();

    this.frame++;

    if (save) {
        var img = this.renderer.domElement.toDataURL();

        console.log('rendering...', img);

        var data = img.replace('data:image/png;base64', '');
        var buf = new AstroFox.Buffer(data, 'base64');
        AstroFox.FS.writeFile('d:/image-' + Date.now() + '.png', buf);

        console.log('render complete');
    }
};

RenderManager.prototype.renderMovie = function() {
    this.render(true);
};

// Supposedly 1.5x faster than Array.splice
function spliceOne(list, index) {
    for (var i = index, k = i+1, n = list.length; k < n; i += 1, k += 1) {
        list[i] = list[k];
    }
    list.pop();
}

module.exports = RenderManager;
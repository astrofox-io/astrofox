'use strict';

var EventEmitter = require('../core/EventEmitter.js');
var _ = require('lodash');
var THREE = require('three');

var defaults = {
    showFPS: true,
    audioOutput: 'mux',
    videoOutput: 'mp4'
};

var Scene = EventEmitter.extend({
    constructor: function(options) {
        this.fps = 0;
        this.ms = 0;
        this.time = 0;
        this.frame = 0;
        this.controls = [];
        this.options = _.assign({}, defaults);
        this.canvas2d = null;
        this.canvas3d = null;
        this.context2d = null;
        this.context3d = null;
    }
});

Scene.prototype.init = function(options) {
    if (typeof options !== 'undefined') {
        for (var prop in options) {
            if (hasOwnProperty.call(this.options, prop)) {
                this.options[prop] = options[prop];
            }
        }
    }
};

Scene.prototype.setupCanvas = function(canvas) {
    this.canvas3d = canvas;

    var width = this.canvas3d.width,
        height = this.canvas3d.height,
        factor = 2;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas3d });
    this.renderer.setSize(width, height);
    this.renderer.autoClear = false;

    // Scene 2D
    this.canvas2d = document.createElement('canvas');
    this.canvas2d.width = width;
    this.canvas2d.height = height;

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

    this.context2d = this.canvas2d.getContext('2d');
    this.context3d = this.canvas3d.getContext('webgl');
};

Scene.prototype.getFPS = function() {
    return this.fps;
};

Scene.prototype.updateFPS = function() {
    var now = performance.now(),
        options = this.options;

    if (options.showFPS) {
        if (!this.time) {
            this.time = now;
        }

        this.frame += 1;

        if (now > this.time + 1000) {
            this.fps = Math.round( (this.frame * 1000) / (now - this.time));
            this.ms = (now - this.time) / this.frame;
            this.time = now;
            this.frame = 0;
        }

        this.renderFPS();
    }
};

Scene.prototype.renderFPS = function() {
    var context = this.context2d;

    context.font = '14px sans-serif';
    context.fillStyle = '#fff';
    context.shadowColor = '#000';
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.fillText(this.fps.toString() + ' FPS, ' + this.ms.toFixed(2) + ' ms', 10, 20);
};

Scene.prototype.clear = function() {
    this.canvas2d.getContext('2d').clearRect(0, 0, this.canvas2d.width, this.canvas2d.height);
};

Scene.prototype.render = function(callback) {
    this.texture2d.needsUpdate = true;

    //this.cube.rotation.x += 0.1;
    //this.cube.rotation.y += 0.1;

    this.updateFPS();

    this.renderer.clear();
    this.renderer.render(this.scene3d, this.camera3d);
    this.renderer.clearDepth();
    this.renderer.render(this.scene2d, this.camera2d);

    if (callback) callback();
};

Scene.prototype.renderVideo = function(output_file, fps, duration, func, callback) {
    var started = false,
        frames = duration * fps,
        input_file = new Node.Stream.Transform();

    console.log('rending movie', duration, 'seconds,', fps, 'fps');

    input_file.on('error', function(err) {
        console.log(err);
    });

    this.callback = function(next) {
        if (next < frames) {
            this.renderImage(function(buffer) {
                input_file.push(buffer);
                func(next, fps, this.callback);
            }.bind(this));
        }
        else {
            input_file.push(null);
        }
    }.bind(this);

    var ffmpeg = Node.Spawn('./bin/ffmpeg.exe', ['-y', '-f', 'image2pipe', '-vcodec', 'png', '-r', fps, '-i', 'pipe:0', '-vcodec', 'libx264', '-movflags', '+faststart', '-pix_fmt', 'yuv420p', '-f', 'mp4', output_file]);
    input_file.pipe(ffmpeg.stdin);
    //ffmpeg.stdout.pipe(outStream);

    ffmpeg.stderr.on('data', function (data) {
        console.log(data.toString());
        if (!started) {
            func(0, fps, this.callback);
            started = true;
        }
    }.bind(this));

    ffmpeg.stderr.on('end', function () {
        console.log('file has been converted succesfully');
        if (callback) callback();
    });

    ffmpeg.stderr.on('exit', function () {
        console.log('child process exited');
    });

    ffmpeg.stderr.on('close', function() {
        console.log('program closed');
    });
};

Scene.prototype.renderImage = function(callback, format) {
    this.render(function() {
        var img = this.renderer.domElement.toDataURL(format || 'image/png'),
            data = img.replace(/^data:image\/\w+;base64,/, ''),
            buffer = new Node.Buffer(data, 'base64');

        if (callback) callback(buffer);
    }.bind(this));
};

module.exports = Scene;
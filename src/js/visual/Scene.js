'use strict';

var Class = require('../core/Class.js');
var EventEmitter = require('../core/EventEmitter.js');
var IO = require('../IO.js');

var _ = require('lodash');
var THREE = require('three');

var defaults = {
    showFPS: false,
    audioOutput: 'mux',
    videoOutput: 'mp4'
};

var Scene = function(options) {
    this.fps = 0;
    this.ms = 0;
    this.time = 0;
    this.frame = 0;
    this.controls = [];
    this.options = _.assign({}, defaults);

    this.renderer = null;
    this.canvas2d = null;
    this.canvas3d = null;
    this.context2d = null;
    this.context3d = null;

    this.init(options);
};

Class.extend(Scene, EventEmitter, {
    init: function (options) {
        if (typeof options !== 'undefined') {
            for (var prop in options) {
                if (hasOwnProperty.call(this.options, prop)) {
                    this.options[prop] = options[prop];
                }
            }
        }
    },

    setupCanvas: function (canvas) {
        var canvas3d = this.canvas3d = canvas,
            canvas2d = this.canvas2d = document.createElement('canvas'),
            scene2d = this.scene2d = new THREE.Scene(),
            scene3d = this.scene3d = new THREE.Scene(),
            width = canvas.width,
            height = canvas.height,
            factor = 2;

        // Renderer
        var renderer = this.renderer = new THREE.WebGLRenderer({canvas: this.canvas3d});
        renderer.setSize(width, height);
        renderer.autoClear = false;

        // Scene 2D
        canvas2d.width = width;
        canvas2d.height = height;

        // Camera 2D
        var camera2d = this.camera2d = new THREE.OrthographicCamera(-1 * width / factor, width / factor, height / factor, -1 * height / factor, 1, 10);
        camera2d.position.z = 10;

        // Texture 2D
        var texture = this.texture2d = new THREE.Texture(this.canvas2d);
        texture.needsUpdate = true;
        THREE.LinearFilter = THREE.NearestFilter = texture.minFilter;

        var material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });

        var sprite = new THREE.Sprite(material);
        sprite.scale.set(material.map.image.width, material.map.image.height, 1);
        sprite.position.set(0, 0, 1);

        scene2d.add(sprite);

        // Scene 3D
        var camera3d = this.camera3d = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
        scene3d.add(camera3d);

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

        this.context2d = canvas2d.getContext('2d');
        this.context3d = canvas3d.getContext('webgl');
    },

    getFPS: function () {
        return this.fps;
    },

    updateFPS: function () {
        var now = performance.now(),
            options = this.options;

        if (options.showFPS) {
            if (!this.time) {
                this.time = now;
            }

            this.frame += 1;

            if (now > this.time + 1000) {
                this.fps = Math.round((this.frame * 1000) / (now - this.time));
                this.ms = (now - this.time) / this.frame;
                this.time = now;
                this.frame = 0;
            }

            this.renderFPS();
        }
    },

    renderFPS: function () {
        var context = this.context2d;

        context.font = '14px sans-serif';
        context.fillStyle = '#fff';
        context.shadowColor = '#000';
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.fillText(this.fps.toString() + ' FPS, ' + this.ms.toFixed(2) + ' ms', 10, 20);
    },

    clear: function () {
        this.canvas2d.getContext('2d').clearRect(0, 0, this.canvas2d.width, this.canvas2d.height);
    },

    render: function (callback) {
        this.texture2d.needsUpdate = true;

        //this.cube.rotation.x += 0.1;
        //this.cube.rotation.y += 0.1;

        this.updateFPS();

        this.renderer.clear();
        this.renderer.render(this.scene3d, this.camera3d);
        this.renderer.clearDepth();
        this.renderer.render(this.scene2d, this.camera2d);

        if (callback) callback();
    },

    renderVideo: function (output_file, fps, duration, func, callback) {
        var started = false,
            frames = duration * fps,
            input_file = new IO.Stream.Transform();

        console.log('rending movie', duration, 'seconds,', fps, 'fps');

        input_file.on('error', function (err) {
            console.log(err);
        });

        this.callback = function (next) {
            if (next < frames) {
                this.renderImage(function (buffer) {
                    input_file.push(buffer);
                    func(next, fps, this.callback);
                }.bind(this));
            }
            else {
                input_file.push(null);
            }
        }.bind(this);

        var ffmpeg = IO.Spawn('./bin/ffmpeg.exe', ['-y', '-f', 'image2pipe', '-vcodec', 'png', '-r', fps, '-i', 'pipe:0', '-vcodec', 'libx264', '-movflags', '+faststart', '-pix_fmt', 'yuv420p', '-f', 'mp4', output_file]);
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

        ffmpeg.stderr.on('close', function () {
            console.log('program closed');
        });
    },

    renderImage: function (callback, format) {
        this.render(function () {
            var img = this.renderer.domElement.toDataURL(format || 'image/png'),
                data = img.replace(/^data:image\/\w+;base64,/, ''),
                buffer = new IO.Buffer(data, 'base64');

            if (callback) callback(buffer);
        }.bind(this));
    }
});

module.exports = Scene;
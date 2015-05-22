'use strict';

var _ = require('lodash');
var THREE = require('three');

var Class = require('core/Class.js');
var EventEmitter = require('core/EventEmitter.js');
var IO = require('IO.js');

var EffectComposer = require('vendor/three/postprocessing/EffectComposer.js');
var RenderPass = require('vendor/three/postprocessing/RenderPass.js');
var ShaderPass = require('vendor/three/postprocessing/ShaderPass.js');
var MaskPass = require('vendor/three/postprocessing/MaskPass.js');
var ClearMaskPass = require('vendor/three/postprocessing/ClearMaskPass.js');

var CopyShader = require('vendor/three/shaders/CopyShader.js');
var AdditiveBlendShader = require('vendor/three/shaders/AdditiveBlendShader.js');

var defaults = {
    showFPS: false,
    audioOutput: 'mux',
    videoOutput: 'mp4',
    width: 854,
    height: 480
};

var Scene = function(options) {
    this.stats = {
        fps: 0,
        ms: 0,
        time: 0,
        frames: 0,
        stack: []
    };

    this.scene2d = new THREE.Scene();
    this.scene3d = new THREE.Scene();
    this.clock = new THREE.Clock();

    this.options = _.assign({}, defaults);

    this.update(options);
};

Class.extend(Scene, EventEmitter, {
    update: function(options) {
        if (typeof options !== 'undefined') {
            for (var prop in options) {
                if (hasOwnProperty.call(this.options, prop)) {
                    this.options[prop] = options[prop];
                }
            }
        }
    },

    loadCanvas: function(canvas) {
        var options = this.options,
            canvas3d = this.canvas3d = canvas,
            canvas2d = this.canvas2d = document.createElement('canvas'),
            scene2d = this.scene2d,
            scene3d = this.scene3d,
            width = canvas.width,
            height = canvas.height,
            right = width / 2,
            top = height / 2,
            left = -1 * right,
            bottom = -1 * top,
            aspect = width / height;

        // Renderer
        var renderer = this.renderer = new THREE.WebGLRenderer({ canvas: canvas3d });
        //renderer.setSize(width, height);
        renderer.autoClear = false;

        // Scene 2D
        canvas2d.width = width;
        canvas2d.height = height;

        // Camera 2D
        var camera2d = this.camera2d = new THREE.OrthographicCamera(left, right, top, bottom, 1, 10);
        camera2d.position.set(0, 0, 10);

        // Camera 3D
        var camera3d = this.camera3d = new THREE.PerspectiveCamera(35, aspect, 0.1, 1000);
        camera3d.position.set(0, 0, 10);

        // Rendering context
        this.context2d = canvas2d.getContext('2d');
        this.context3d = canvas3d.getContext('webgl');

        // Texture 2D
        var texture = this.texture = new THREE.Texture(canvas2d);
        texture.needsUpdate = true;
        THREE.LinearFilter = THREE.NearestFilter = texture.minFilter;

        var material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });

        var sprite = new THREE.Sprite(material);
        sprite.scale.set(material.map.image.width, material.map.image.height, 1);

        // Add objects
        scene3d.add(camera3d);
        scene2d.add(sprite);

        // Processing
        var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false };
        var parameters2 = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false };

        var renderTarget = new THREE.WebGLRenderTarget(canvas.width, canvas.height, parameters);
        var renderTarget2 = new THREE.WebGLRenderTarget(canvas.width, canvas.height, parameters2);

        var composer3d = this.composer3d = new EffectComposer(renderer, renderTarget);
        var composer2d = this.composer2d = new EffectComposer(renderer, renderTarget2);
        var composerf = this.composerf = new EffectComposer(renderer);

        var copyPass = new ShaderPass(CopyShader);
        copyPass.renderToScreen = true;

        var blendPass = new ShaderPass(AdditiveBlendShader);
        blendPass.uniforms[ 'tBase' ].value = composer3d.renderTarget2;
        blendPass.uniforms[ 'tAdd' ].value = composer2d.renderTarget2;
        blendPass.renderToScreen = true;

        var render3d = new RenderPass(scene3d, camera3d);
        var render2d = new RenderPass(scene2d, camera2d);

        composer3d.addPass(render3d);
        composer2d.addPass(render2d);
        composerf.addPass(blendPass);
    },

    clearCanvas: function() {
        this.canvas2d.getContext('2d').clearRect(0, 0, this.canvas2d.width, this.canvas2d.height);
    },

    renderFrame: function(displays, data, callback) {
        var texture = this.texture;

        this.clearCanvas();

        // Render displays
        displays.forEach(function(display) {
            if (display.renderToCanvas) {
                display.renderToCanvas(this, data);
                texture.needsUpdate = true;
            }
            else if (display.updateScene) {
                display.updateScene(this, data);
            }
        }.bind(this));

        this.render();

        if (callback) callback();
    },

    render: function(callback) {
        this.updateFPS();

        // Render 3D objects
        this.renderer.clear();

        //this.renderer.render(this.scene3d, this.camera3d);
        this.composer3d.render(0.1);
        this.composer2d.render(0.1);
        this.composerf.render(0.1);

        // Render 2D sprites
        //this.renderer.clearDepth();
        //this.renderer.render(this.scene2d, this.camera2d);

        if (callback) callback();
    },

    renderVideo: function(output_file, fps, duration, func, callback) {
        var started = false,
            frames = duration * fps,
            input_file = new IO.Stream.Transform();

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

        var ffmpeg = IO.Spawn('./bin/ffmpeg.exe', ['-y', '-f', 'image2pipe', '-vcodec', 'png', '-r', fps, '-i', 'pipe:0', '-vcodec', 'libx264', '-movflags', '+faststart', '-pix_fmt', 'yuv420p', '-f', 'mp4', output_file]);
        input_file.pipe(ffmpeg.stdin);
        //ffmpeg.stdout.pipe(outStream);

        ffmpeg.stderr.on('data', function(data) {
            console.log(data.toString());
            if (!started) {
                func(0, fps, this.callback);
                started = true;
            }
        }.bind(this));

        ffmpeg.stderr.on('end', function() {
            console.log('file has been converted succesfully');
            if (callback) callback();
        });

        ffmpeg.stderr.on('exit', function() {
            console.log('child process exited');
        });

        ffmpeg.stderr.on('close', function() {
            console.log('program closed');
        });
    },

    renderImage: function(callback, format) {
        this.renderToCanvas(function() {
            var img = this.renderer.domElement.toDataURL(format || 'image/png'),
                data = img.replace(/^data:image\/\w+;base64,/, ''),
                buffer = new IO.Buffer(data, 'base64');

            if (callback) callback(buffer);
        }.bind(this));
    },

    getSize: function() {
        var canvas =  this.canvas3d;

        return {
            width: canvas.width,
            height: canvas.height
        };
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
    }
});

module.exports = Scene;

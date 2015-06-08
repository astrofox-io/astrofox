'use strict';

var _ = require('lodash');
var THREE = require('three');
var Class = require('core/Class.js');
var Display = require('display/Display.js');
var SpectrumParser = require('audio/SpectrumParser.js');
var Composer = require('graphics/Composer.js');
var GridShader = require('shaders/GridShader.js');
var DotScreenShader = require('vendor/three/shaders/DotScreenShader.js');
var RGBShiftShader = require('vendor/airtight/shaders/RGBShiftShader.js');
var MirrorShader = require('vendor/airtight/shaders/MirrorShader.js');

var ColorHalftoneShader = require('shaders/ColorHalftoneShader.js');
var ColorShiftShader = require('shaders/ColorShiftShader.js');
var HexagonPixelateShader = require('shaders/HexagonPixelateShader.js');

var defaults = {
    shape: 'Cube',
    x: 0,
    y: 0,
    z: 0,
    wireframe: false
};

var id = 0;

var GeometryDisplay = function(options) {
    Display.call(this, id++, 'GeometryDisplay', '3d', defaults);

    this.update(options);
};

GeometryDisplay.info = {
    name: '3D Geometry'
};

Class.extend(GeometryDisplay, Display, {
    update: function(options) {
        if (typeof options !== 'undefined') {
            if (options.wireframe !== undefined) {
                this.material.wireframe = options.wireframe;
                this.material.needsUpdate = true;

            }

            if (options.shape !== undefined && options.shape !== this.options.shape) {
                this.createMesh(options.shape);
            }

            this._super.update.call(this, options);
        }
    },

    addToScene: function(view) {
        var options = this.options,
            //composer = view.composer,
            composer = this.composer = new Composer(view.renderer),
            scene = this.scene = new THREE.Scene();

        var camera = this.camera = new THREE.PerspectiveCamera(45, view.width/view.height, 1, 10000);
        camera.position.set(0, 0, 300);

        this.createMesh(options.shape);

        this.pass = composer.addRenderPass(scene, camera);
        //this.pass = composer.addRenderPass(scene, camera, { transparent: true, clearDepth: true, forceClear: true, renderToScreen: true });
        //composer.addShaderPass(RGBShiftShader, { console.log: true, clearDepth: true });
        //composer.renderToScreen({ transparent: true, clearDepth: true, forceClear: true });
        //composer.addCopyPass({ renderToScreen: true });
        composer.addShaderPass(MirrorShader);
        composer.addShaderPass(DotScreenShader);
        composer.addShaderPass(RGBShiftShader);
        composer.renderToScreen({ clearDepth: true, transparent: true });

        //console.log(composer);
    },

    removeFromScene: function(view) {
        this.scene.remove(this.mesh);
        view.composer.removePass(this.pass);
    },

    updateScene: function(view, data) {
        var options = this.options,
            fft = this.fft = SpectrumParser.parseFFT(data.fft, { normalize: true }, this.fft),
            x = fft[0],
            y = fft[3];

        this.mesh.rotation.x += 5 * x;
        this.mesh.rotation.y += 3 * y;

        this.mesh.position.set(options.x, options.y, options.z);

        this.composer.render();
    },

    createMesh: function(shape) {
        var geometry, material,
            scene = this.scene,
            mesh = this.mesh,
            options = this.options;

        if (mesh) {
            scene.remove(mesh);
        }

        switch (shape) {
            case 'Cube':
                geometry = new THREE.BoxGeometry(50,50,50);
                break;
            case 'Sphere':
                geometry = new THREE.SphereGeometry(40,10,10);
                break;
            case 'Dodecahedron':
                geometry = new THREE.DodecahedronGeometry(40, 0);
                break;
            case 'Icosahedron':
                geometry = new THREE.IcosahedronGeometry(40, 0);
                break;
            case 'Octahedron':
                geometry = new THREE.OctahedronGeometry(40, 0);
                break;
            case 'Tetrahedron':
                geometry = new THREE.TetrahedronGeometry(40, 0);
                break;
            case 'Torus':
                geometry = new THREE.TorusGeometry(50, 20, 10, 10);
                break;
            case 'Torus Knot':
                geometry = new THREE.TorusKnotGeometry(50, 10, 20, 10, 1, 3);
                break;
        }

        material = this.material = new THREE.ShaderMaterial(THREE.ShaderLib['normal']);
        material.wireframe = options.wireframe;
        material.needsUpdate = true;

        mesh = new THREE.Mesh(geometry, material);

        scene.add(mesh);

        this.mesh = mesh;
    }
});

module.exports = GeometryDisplay;
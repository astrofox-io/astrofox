'use strict';

var _ = require('lodash');
var THREE = require('three');
var Class = require('core/Class.js');
var Display = require('display/Display.js');
var GridShader = require('shaders/GridShader.js');

var defaults = {
    geometry: 'mesh',
    x: 0,
    y: 0,
    z: 0,
    wireframe: false
};

var id = 0;

var ObjectDisplay = function(options) {
    Display.call(this, id++, 'ObjectDisplay', '3d', defaults);

    this.update(options);
};

ObjectDisplay.info = {
    name: '3D Object'
};

Class.extend(ObjectDisplay, Display, {
    update: function(options) {
        if (typeof options !== 'undefined') {
            this._super.update.call(this, options);

            if (options.wireframe !== undefined) {
                this.material.wireframe = this.options.wireframe;
                this.material.needsUpdate = true;

            }

            if (options.shape !== undefined && options.shape !== this.options.shape) {
                this.createMesh(options.shape);
            }
        }
    },

    addToScene: function(view) {
        var options = this.options,
            scene = this.scene = new THREE.Scene();

        var camera = this.camera = new THREE.PerspectiveCamera(45, view.width/view.height, 1, 10000);
        camera.position.set(0, 0, 300);

        this.createMesh(options.shape);

        this.pass = view.composer.addRenderPass(scene, camera, { transparent: true, clearDepth: true, renderToScreen: true });
    },

    removeFromScene: function(view) {
        this.scene.remove(this.mesh);
        view.composer.removePass(this.pass);
    },

    updateScene: function(view) {
        var options = this.options;

        this.mesh.rotation.x += 0.025;
        this.mesh.rotation.y += 0.05;

        this.mesh.position.set(options.x, options.y, options.z);
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

module.exports = ObjectDisplay;
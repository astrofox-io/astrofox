'use strict';

var _ = require('lodash');
var THREE = require('three');
var Class = require('core/Class.js');
var Display = require('display/Display.js');

var defaults = {
    x: 0,
    y: 0,
    z: 0
};

var id = 0;

var CubeDisplay = function(options) {
    Display.call(this, id++, 'CubeDisplay', '3d', defaults);

    this.update(options);
};

CubeDisplay.info = {
    name: '3D Cube'
};

Class.extend(CubeDisplay, Display, {
    addToScene: function(scene) {
        var space = scene.scene;

        var pointLight = new THREE.PointLight(0xffffff);
        pointLight.position.set(10, 50, 130);

        var geometry = new THREE.BoxGeometry(1,1,1);
        var material = new THREE.ShaderMaterial(THREE.ShaderLib['normal']);
        material.needsUpdate = true;
        var cube = this.cube = new THREE.Mesh(geometry, material);

        space.add(pointLight);
        space.add(cube);
    },

    removeFromScene: function(scene) {
        scene.scene.remove(this.cube);
    },

    updateScene: function(scene) {
        var options = this.options;

        this.cube.rotation.x += 0.025;
        this.cube.rotation.y += 0.05;

        this.cube.position.set(options.x, options.y, options.z);
    }
});

module.exports = CubeDisplay;
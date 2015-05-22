'use strict';

var _ = require('lodash');
var THREE = require('three');
var Class = require('../core/Class.js');
var Display = require('./Display.js');
var Shader = require('../../shaders/test/TestShader.js');

var defaults = {
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
        var space = scene.scene3d;

        var pointLight = new THREE.PointLight(0xffffff);
        pointLight.position.set(10, 50, 130);

        var geometry = new THREE.BoxGeometry(1,1,1);
        //var material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
        //var Shader = {uniforms: uniforms, fragmentShader: fragment, vertexShader: vertex};
        var material = new THREE.ShaderMaterial(Shader);
        material.needsUpdate = true;
        var cube = this.cube = new THREE.Mesh(geometry, material);

        space.add(pointLight);
        space.add(cube);
    },

    removeFromScene: function(scene) {
        scene.scene3d.remove(this.cube);
    },

    updateScene: function(scene) {
        Shader.uniforms.time.value += scene.clock.getDelta() * 5;
        this.cube.rotation.x += 0.025;
        this.cube.rotation.y += 0.05;
    }
});

module.exports = CubeDisplay;
'use strict';

var _ = require('lodash');
var THREE = require('three');
var Class = require('../core/Class.js');
var Display = require('./Display.js');
var Shader = require('../vendor/three/shaders/VerticalBlurShader');

var defaults = {
};

var id = 0;

var uniforms = {
    time: { type: "f", value: 1.0 },
    resolution: { type: "v2", value: new THREE.Vector2() }
};

var fragment = `
uniform float time;
uniform vec2 resolution;

varying vec2 vUv;

void main( void ) {
    vec2 position = -1.0 + 2.0 * vUv;

    float red = abs( sin( position.x * position.y + time / 5.0 ) );
    float green = abs( sin( position.x * position.y + time / 4.0 ) );
    float blue = abs( sin( position.x * position.y + time / 3.0 ) );
    gl_FragColor = vec4( red, green, blue, 1.0 );
}`;

var vertex = `
varying vec2 vUv;

void main()
{
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}`;

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
        var material = new THREE.ShaderMaterial({uniforms: uniforms, fragmentShader: fragment, vertexShader: vertex});
        material.needsUpdate = true;
        var cube = this.cube = new THREE.Mesh(geometry, material);

        space.add(pointLight);
        space.add(cube);
    },

    removeFromScene: function(scene) {
        scene.scene3d.remove(this.cube);
    },

    updateScene: function(scene) {
        uniforms.time.value += scene.clock.getDelta() * 5;
        this.cube.rotation.x += 0.025;
        this.cube.rotation.y += 0.05;
    }
});

module.exports = CubeDisplay;
'use strict';

var THREE = require('three');
var Class = require('core/Class.js');
var ComposerPass = require('graphics/ComposerPass.js');

var defaults = {
    textureId: 'tDiffuse',
    transparent: false,
    needsSwap: true,
    forceClear: false
};

var ShaderPass = function(shader, options) {
    ComposerPass.call(this, defaults);

    this.update(options);

    this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    this.material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        defines: shader.defines || {},
        transparent: this.options.transparent
    });

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
    this.scene.add(this.mesh);
};

Class.extend(ShaderPass, ComposerPass, {
    render: function(renderer, writeBuffer, readBuffer) {
        var options = this.options;

        if (this.uniforms[options.textureId] ) {
            this.uniforms[options.textureId].value = readBuffer;
        }

        this.mesh.material = this.material;

        this.process(renderer, this.scene, this.camera, writeBuffer);
    }
});

module.exports = ShaderPass;
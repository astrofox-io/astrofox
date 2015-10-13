'use strict';

var _ = require('lodash');
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
    ComposerPass.call(this, _.assign({}, defaults, options));

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
    this.plane = new THREE.PlaneBufferGeometry(2, 2);
    this.mesh = new THREE.Mesh(this.plane, null);
    this.scene.add(this.mesh);
};

Class.extend(ShaderPass, ComposerPass, {
    setUniforms: function(props) {
        var uniforms = this.uniforms;

        for (var prop in props) {
            if (uniforms.hasOwnProperty(prop)) {
                if (uniforms[prop].value.set) {
                    console.log('setting', uniforms[prop], props[prop]);
                    uniforms[prop].value.set.apply(uniforms[prop].value, props[prop]);
                }
                else {
                    uniforms[prop].value = props[prop];
                }
            }
        }

        this.material.needsUpdate = true;
    },

    render: function(renderer, writeBuffer, readBuffer) {
        var options = this.options;

        if (this.material.uniforms[options.textureId] ) {
            this.material.uniforms[options.textureId].value = readBuffer;
        }

        this.mesh.material = this.material;

        this.process(renderer, this.scene, this.camera, writeBuffer);
    }
});

module.exports = ShaderPass;
'use strict';

var _ = require('lodash');
var THREE = require('three');
var ComposerPass = require('../graphics/ComposerPass.js');

var defaults = {
    textureId: 'tDiffuse',
    transparent: false,
    needsSwap: true,
    forceClear: false,
    blending: THREE.NormalBlending
};

var ShaderPass = function(shader, options) {
    ComposerPass.call(this, _.assign({}, defaults, options));

    this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    this.material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        defines: shader.defines || {},
        transparent: this.options.transparent,
        blending: this.options.blending
    });

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.geometry = new THREE.PlaneBufferGeometry(2, 2);
    this.mesh = new THREE.Mesh(this.geometry, null);
    this.mesh.material = this.material;
    this.scene.add(this.mesh);
};

ShaderPass.prototype = _.create(ComposerPass.prototype, {
    constructor: ShaderPass,
    
    setUniforms: function(props) {
        var uniforms = this.uniforms;

        for (var prop in props) {
            if (props.hasOwnProperty(prop) && uniforms.hasOwnProperty(prop)) {
                if (uniforms[prop].value != null && typeof uniforms[prop].value.set !== 'undefined') {
                    uniforms[prop].value.set.apply(uniforms[prop].value, props[prop]);
                }
                else {
                    uniforms[prop].value = props[prop];
                }
            }
        }

        this.material.needsUpdate = true;
    },

    process: function(renderer, writeBuffer, readBuffer) {
        var options = this.options;

        if (readBuffer && this.material.uniforms[options.textureId] ) {
            this.material.uniforms[options.textureId].value = readBuffer;
        }

        this.render(renderer, this.scene, this.camera, writeBuffer);
    }
});

module.exports = ShaderPass;
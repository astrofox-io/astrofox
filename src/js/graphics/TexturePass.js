'use strict';

var THREE = require('three');
var Class = require('core/Class.js');
var ComposerPass = require('graphics/ComposerPass.js');
var CopyShader = require('shaders/CopyShader.js');

var defaults = {
    opacity: 1.0,
    transparent: true,
    needsSwap: false,
    needsUpdate: true,
    forceClear: true
};

var TexturePass = function(texture, options) {
    ComposerPass.call(this, defaults);

    this.update(options);

    this.texture = texture;

    this.uniforms = THREE.UniformsUtils.clone(CopyShader.uniforms);
    this.uniforms['opacity'].value = this.options.opacity;
    this.uniforms['tDiffuse'].value = texture;

    this.material = new THREE.ShaderMaterial( {
        uniforms: this.uniforms,
        vertexShader: CopyShader.vertexShader,
        fragmentShader: CopyShader.fragmentShader,
        transparent: this.options.transparent
    } );

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material);
    this.scene.add(this.mesh);
};

Class.extend(TexturePass, ComposerPass, {
    render: function(renderer, writeBuffer, readBuffer) {
        var options = this.options;

        //this.mesh.material = this.material;
        this.texture.needsUpdate = options.needsUpdate;

        this.process(renderer, this.scene, this.camera, readBuffer);
    }
});

module.exports = TexturePass;
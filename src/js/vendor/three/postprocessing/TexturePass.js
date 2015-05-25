/**
 * @author alteredq / http://alteredqualia.com/
 */

var THREE = require('three');

var CopyShader = require('../shaders/CopyShader.js');

var TexturePass = function ( texture, opacity ) {

	if ( CopyShader === undefined )
		console.error( "TexturePass relies on CopyShader" );

	var shader = CopyShader;

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.uniforms[ "opacity" ].value = ( opacity !== undefined ) ? opacity : 1.0;
	this.uniforms[ "tDiffuse" ].value = texture;

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
        transparent: true

	} );

	this.enabled = true;
    this.clear = true;
	this.needsSwap = false;
    this.clearDepth = false;

	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

TexturePass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		this.quad.material = this.material;

        if (this.clearDepth) renderer.clearDepth();

		renderer.render( this.scene, this.camera, readBuffer, this.clear );

	}

};

module.exports = TexturePass;
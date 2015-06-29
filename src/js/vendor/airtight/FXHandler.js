//UberViz FXHandler
//Handles Post-Proc Shaders

//simple 1 pass shaders

//TODO - add back 2 pass glow + dot matrix

var FXHandler = function() {

	var fxParams = {
		fullSize: false,
		bloom:false,
		//waveform:false,
		//god:false,
		shake:false,
		brightnessContrast:false,
	//	dotScreen: false,
		film:false,
		hueSaturation:false,
		kaleido:false,
		mirror:true,
		RGBShift:true,
		vignette:true,
		badTV:false,
		wobble:false,
		dotMatrix:false,
		tile:false,
		audioLevels:false,
		strobe:false,
		strobePeriod: 2,
		colorCycle: false,
		colorify:false,
		sceneTilt:0.5,
		saturation: 0,
		colorifyAmt: 0,
		vignetteAmount:0.5,
		staticAmount:0.5,
		staticy:false,
		glitch:false

	};

	var shaderTime = 0;
	var screenW = 800;
	var screenH = 600;
	var blurriness = 3;

	var composer;

	function init(){

		//EVENT HANDLERS
		events.on("update", update);
		events.on("onBeat", onBeat);

		//INIT CONTROLS
		var folder = ControlsHandler.getGui().addFolder('FX');
		folder.add(fxParams, 'mirror').onChange(toggleShaders);
		folder.add(fxParams, 'RGBShift').onChange(toggleShaders);
		folder.add(fxParams, 'vignette').onChange(toggleShaders);
		

		//folder.add(fxParams, 'fullSize').listen().onChange(VizHandler.onResize).name("Full Size");
		// folder.add(fxParams, 'colorify').onChange(toggleShaders);
		// //folder.add(fxParams, 'colorifyAmt', 0, 1).onChange(setShaderParams).step(0.1);
		// //folder.add(fxParams, 'god').onChange(toggleShaders);
		// folder.add(fxParams, 'film').onChange(toggleShaders);
		// folder.add(fxParams, 'bloom').onChange(toggleShaders);
		// folder.add(fxParams, 'brightnessContrast').onChange(toggleShaders);
		// //folder.add(fxParams, 'dotScreen').onChange(toggleShaders);
		// folder.add(fxParams, 'shake').onChange(toggleShaders);
		// //folder.add(fxParams, 'waveform').onChange(toggleShaders);
		// folder.add(fxParams, 'hueSaturation').onChange(toggleShaders);
		// folder.add(fxParams, 'colorCycle').onChange(setShaderParams);
		// folder.add(fxParams, 'kaleido').onChange(toggleShaders);

		
		// folder.add(fxParams, 'badTV').onChange(toggleShaders);
		// folder.add(fxParams, 'wobble').onChange(toggleShaders);
		// folder.add(fxParams, 'dotMatrix').onChange(toggleShaders);
		// folder.add(fxParams, 'tile').onChange(toggleShaders);
		// folder.add(fxParams, 'audioLevels').onChange(toggleShaders);
		// folder.add(fxParams, 'strobe').onChange(toggleShaders);
		// folder.add(fxParams, 'staticy').onChange(toggleShaders);
		// folder.add(fxParams, 'glitch').onChange(toggleShaders);
		// folder.add(fxParams, 'strobePeriod', 2, 60).onChange(setShaderParams).step(1);
		// //folder.add(fxParams, 'saturation', -1, 1).onChange(setShaderParams).step(0.1);
		// folder.add(fxParams, 'vignetteAmount', 0, 1.3).onChange(setShaderParams).step(0.1);
		// folder.add(fxParams, 'staticAmount', 0,1).onChange(setShaderParams).step(0.1);

		// folder.add(fxParams, 'sceneTilt', 0, 1).name("Scene Tilt");

		folder.open();

		//CREATE FX PASSES
		renderPass = new THREE.RenderPass( VizHandler.getScene(), VizHandler.getCamera() );
		copyPass = new THREE.ShaderPass( THREE.CopyShader );

		mirrorPass = new THREE.ShaderPass( THREE.MirrorShader );
		mirrorPass.uniforms.side.value =4;

		RGBShiftPass = new THREE.ShaderPass( THREE.RGBShiftShader );

		vignettePass = new THREE.ShaderPass( THREE.VignetteShader );
		vignettePass.uniforms[ "darkness" ].value = 2;

		//bloom pass
		//strength, kernelSize, sigma, resolution.
		//defaults to: 1, 25, 4.0, 256
		//if kernelsize increased must also increase sigma
		//larger kernel means more processinbg

		// bloomPass = new THREE.BloomPass(3, 12, 2.0, 512  ); //GOOD
		// //bloomPass = new THREE.BloomPass(2, 25, 4.0, 512 );
		// //bloomPass = new THREE.BloomPass(  2, 12, 2.0, 512); //more subtle

		// brightnessContrastPass = new THREE.ShaderPass( THREE.BrightnessContrastShader );
		// brightnessContrastPass.uniforms[ "contrast" ].value = 0.8;

		// audioLevelsPass = new THREE.ShaderPass( THREE.BrightnessContrastShader );

		// wobblePass = new THREE.ShaderPass( THREE.WobbleShader );

		// // godPass = new THREE.ShaderPass( THREE.GodShader );

		// // godPass.uniforms.fX.value = 0.5; //x light pos
		// // godPass.uniforms.fY.value = 0.5; //y light pos
		// // godPass.uniforms.fDecay.value = 0.90;//0.93; //strength
		// // godPass.uniforms.fDensity.value = 0.96;//0.96;  //spread
		// // godPass.uniforms.fWeight.value = 0.2;//0.4; //strength
		// // godPass.uniforms.fClamp.value = 1.0;//1.0;


		// //dotScreenPass = new THREE.ShaderPass( THREE.DotScreenShader );
		// //dotScreenPass = new THREE.DotScreenPass( new THREE.Vector2( 0, 0 ), 0.5, 2.8 );

		// filmPass = new THREE.ShaderPass( THREE.FilmShader );
		// filmPass.uniforms[ "grayscale" ].value = 0;
		// filmPass.uniforms[ "sIntensity" ].value = 0.9;
		// filmPass.uniforms[ "nIntensity" ].value = 0.4;
		// filmPass.uniforms[ "sCount" ].value = 800;


		// hueSaturationPass = new THREE.ShaderPass( THREE.HueSaturationShader );
		// //hueSaturationPass.uniforms[ "hue" ].value = 0.5;
		// hueSaturationPass.uniforms[ "saturation" ].value = 0.5;

		// hueSaturationPass.uniforms[ 'hue' ].value = 1;

		// kaleidoPass = new THREE.ShaderPass( THREE.KaleidoShader );

		

		// shakePass = new THREE.ShaderPass( THREE.ShakeShader );

		// colorifyPass = new THREE.ShaderPass( THREE.ColorifyShader );
		// colorifyPass.uniforms[ "color" ].value = new THREE.Color( 0xff0000 );

		// tilePass = new THREE.ShaderPass( THREE.TileShader );
		// tilePass.uniforms[ "size" ].value = 0.25;

		// dotMatrixPass = new THREE.ShaderPass( THREE.DotMatrixShader );
		// dotMatrixPass.uniforms[ "dots" ].value = 80;
		// dotMatrixPass.uniforms[ "size" ].value = 0.3;
		// dotMatrixPass.uniforms[ "blur" ].value = 0.3;

		

		// strobePass = new THREE.ShaderPass( THREE.StrobeShader );

		// badTVPass = new THREE.ShaderPass( THREE.BadTVShader );
		// badTVPass.uniforms[ "rollSpeed" ].value = 0;
		// badTVPass.uniforms[ "distortion" ].value = 0;
		// badTVPass.uniforms[ "distortion2" ].value = 0;

		// waveformPass = new THREE.ShaderPass( THREE.WaveformShader );

		// staticPass = new THREE.ShaderPass( THREE.StaticShader );

		// staticPass.uniforms[ 'size' ].value =  1;
		// staticPass.uniforms[ 'amount' ].value =  .3;

		// glitchPass = new THREE.GlitchPass(32);
		// //glitchPass.goWild=true;

		setShaderParams();

		toggleShaders();

	}

	function onBeat(){

		//Some FX is beat controlled
		//badTVPass.uniforms[ "distortion" ].value = 4.0;
		//badTVPass.uniforms[ "distortion2" ].value = 5.0;


		//staticPass.uniforms[ 'amount' ].value =  .8;

		//wobblePass.uniforms[ "distortion" ].value = 80.0;

		mirrorPass.uniforms[ "side" ].value = ATUtil.randomInt(0,12); //only mirror sometimes
		//kaleidoPass.uniforms[ "sides" ].value = ATUtil.randomInt(4,12);


		//glitchPass.uniforms[ "byp" ].value = 1.0;

		setTimeout(onBeatEnd,300);
	}

	function onBeatEnd(){
		//badTVPass.uniforms[ "distortion" ].value = 0.0001;
		//badTVPass.uniforms[ "distortion2" ].value = 0.0001;

		//wobblePass.uniforms[ "distortion" ].value = 0.0;


		//glitchPass.uniforms[ "byp" ].value = 0.0;

		//staticPass.uniforms[ 'amount' ].value =  .3;

	}

	function update( t ) {

		//some shdares require time input
		shaderTime += 0.1;
		//filmPass.uniforms[ 'time' ].value =  shaderTime;
		//badTVPass.uniforms[ 'time' ].value =  shaderTime;
		//strobePass.uniforms[ 'time' ].value =  shaderTime;
		//wobblePass.uniforms[ 'time' ].value =  shaderTime;
		//shakePass.uniforms[ 'time' ].value =  shaderTime;
		//staticPass.uniforms[ 'time' ].value =  shaderTime;


		// var hueCyclePeriod = 24; //4 second cycle period (.1 * 60fps * 4)

		// var hue = shaderTime/hueCyclePeriod % 2 - 1;
		// //UberVizMain.trace(hue);
		// hueSaturationPass.uniforms[ 'hue' ].value =  hue; //-1 to 1

		// var col = new THREE.Color();
		// col.setHSL((shaderTime/hueCyclePeriod % 2 /2), 1.0, 0.5);

		// colorifyPass.uniforms[ 'color' ].value =  col;

		RGBShiftPass.uniforms[ "angle" ].value = Math.sin(shaderTime/6)*Math.PI*2;
		//RGBShiftPass.uniforms[ "amount" ].value = (Math.sin(shaderTime/4) + 1)*0.005;

		RGBShiftPass.uniforms[ "amount" ].value = 0.005 + AudioHandler.getVolume()*0.01;

		// shakePass.uniforms[ "amount" ].value = AudioHandler.getVolume()*0.1;

		// //go black when silent
		// audioLevelsPass.uniforms[ 'brightness' ].value =  Math.min(AudioHandler.getVolume()*2 - 1,0);

		//waveformPass.uniforms[ "waveform" ].value = waveData;
		// var wfd = [];
		// for(var i = 0; i < 512; i++) {
		// 	wfd.push(Math.random());
		// }
		// waveformPass.uniforms[ "waveform" ].value = wfd;
		// waveformPass.uniforms[ "distortion" ].value = '1.0';


		composer.render( 0.1 );
	}

	function setShaderParams(){
		//strobePass.uniforms[ 'period' ].value =  fxParams.strobePeriod;
		//hueSaturationPass.uniforms[ 'saturation' ].value =  fxParams.saturation;
		vignettePass.uniforms[ 'offset' ].value =  fxParams.vignetteAmount;
		//staticPass.uniforms[ 'amount' ].value =  fxParams.staticAmount;
		//colorifyPass.uniforms[ 'amount' ].value =  fxParams.colorifyAmt;
	}

	function toggleShaders() {

		//recreate composer chain each time
		composer = new THREE.EffectComposer( VizHandler.getRenderer());

		//Add Shader Passes to Composer

		composer.addPass( renderPass );


		if (fxParams.mirror){
			composer.addPass( mirrorPass );
		}
		if (fxParams.RGBShift){
			composer.addPass( RGBShiftPass );
		}
		if (fxParams.vignette){
			composer.addPass( vignettePass );
		}


		// if (fxParams.bloom){
		// 	composer.addPass( bloomPass );
		// }

		// // if (fxParams.god){
		// // 	composer.addPass( godPass );
		// // }


		// if (fxParams.brightnessContrast){
		// 	composer.addPass( brightnessContrastPass );
		// }


		// if (fxParams.hueSaturation){
		// 	composer.addPass( hueSaturationPass );
		// }
		// if (fxParams.kaleido){
		// 	composer.addPass( kaleidoPass );
		// }
		// if (fxParams.tile){
		// 	composer.addPass( tilePass );
		// }
		
		// if (fxParams.badTV){
		// 	composer.addPass( badTVPass );
		// }
		// if (fxParams.colorShift){
		// 	composer.addPass( colorShiftPass );
		// }
		// if (fxParams.wobble){
		// 	composer.addPass( wobblePass );
		// }

		// if (fxParams.dotMatrix){
		// 	composer.addPass( dotMatrixPass );
		// }

		// if (fxParams.film){
		// 	composer.addPass( filmPass );
		// }

		// if (fxParams.audioLevels){
		// 	composer.addPass( audioLevelsPass );
		// }
		// if (fxParams.strobe){
		// 	composer.addPass( strobePass );
		// }
		// if (fxParams.colorify){
		// 	composer.addPass( colorifyPass );
		// }

		// if (fxParams.dotScreen){
		// 	composer.addPass( dotScreenPass );
		// }

		// if (fxParams.staticy){
		// 	composer.addPass( staticPass );
		// }

		// // if (fxParams.waveform){
		// //	composer.addPass( waveformPass );
		// // }
		// if (fxParams.shake){
		// 	composer.addPass( shakePass );
		// }

		// if (fxParams.glitch){
		// 	composer.addPass( glitchPass );
		// }

		composer.addPass( copyPass );
		//set last pass in composer chain to renderToScreen
		copyPass.renderToScreen = true;
	}

	return {
		init:init,
		update:update,
		onBeat:onBeat,
		fxParams:fxParams
	};

}();
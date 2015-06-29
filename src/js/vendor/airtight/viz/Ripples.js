var Ripples = function() {

	//Viz Template

	var groupHolder;

	var vizParams = {
		on:true,
		lineCount: 50.0,
		dotSize: 0.3,
		lineSize: 0.1,
		blur: 0.1,
		noiseSpeed: 10,
		noiseSize: 4,
		lineSpeed: 1,
		depth:80,
		auto:true,
		vizMode:0 //0 lines, 1 dots, 2 both
	};

	// var uniforms = {
	// 	noiseTime: { type: "f", value: 1.0 },
	// 	noiseSize: { type: "f", value: 2.0 },
	// 	lineTime: { type: "f", value: 1.0 },
	// 	lineCount: { type: "f", value: 40.0 },
	// 	thickness: { type: "f", value: 0.1 },
	// 	blur: { type: "f", value: 0.05 },
	// 	depth: { type: "f", value: 300 },
	// };

	function init(){

		//INIT CONTROLS
		var folder = ControlsHandler.getVizFolder().addFolder('Ripples');
		folder.add(vizParams, 'on').onChange(onToggleViz);
		folder.add(vizParams, 'auto').onChange();

		folder.add(vizParams, 'lineCount', 0, 100).listen().onChange(onParamsChange);
		folder.add(vizParams, 'dotSize', 0, 1.5).listen().onChange(onParamsChange);
		folder.add(vizParams, 'lineSize', 0, 1).listen().onChange(onParamsChange);
		folder.add(vizParams, 'blur', 0.01, 0.5).listen().onChange(onParamsChange);
		folder.add(vizParams, 'noiseSpeed', 0, 50).listen().onChange(onParamsChange);
		folder.add(vizParams, 'noiseSize', 0, 10).listen().onChange(onParamsChange);
		folder.add(vizParams, 'lineSpeed', 0, 5).listen().onChange(onParamsChange);
		folder.add(vizParams, 'depth', 0, 600).listen().onChange(onParamsChange);
		folder.open();

		onParamsChange();



		onToggleViz();
	}


	function onToggleViz(){


		if (vizParams.on){

			//EVENT HANDLERS
			events.on("update", update);
			events.on("onBeat", onBeat);
			events.on("onBPMBeat", onBPMBeat);


			groupHolder = new THREE.Object3D();
			VizHandler.getVizHolder().add(groupHolder);


			var material = new THREE.ShaderMaterial( {

				uniforms: 		THREE.RipplesShader.uniforms,
				vertexShader:  	THREE.RipplesShader.vertexShader,
				fragmentShader: THREE.RipplesShader.fragmentShader,
				depthTest: false,
				
				//side: THREE.DoubleSide,
				blending: THREE.AdditiveBlending,
				//transparent: true

			} );


			//Add  plane
			var planeGeometry = new THREE.PlaneGeometry( 600, 600,100,100 );
			var plane = new THREE.Mesh( planeGeometry, material );
			groupHolder.add( plane );
			plane.z = 0;
			plane.scale.x = plane.scale.y = 4;


			//Add  sphere
			// var sphereGeometry = new THREE.SphereGeometry( 200, 40,40 );
			// //var sphereGeometry =new THREE.IcosahedronGeometry( 200, 4 );

			// var sphere = new THREE.Mesh( sphereGeometry, material );
			// groupHolder.add( sphere );
			// sphere.z = 0;
			// sphere.scale.x = sphere.scale.y = 2.0;


		}else{

			//EVENT HANDLERS
			events.off("update", update);
			events.off("onBeat", onBeat);
			events.off("onBPMBeat", onBPMBeat);

			if (groupHolder){
				VizHandler.getVizHolder().remove(groupHolder);
				groupHolder = null;
			}
		}

	}

	function onParamsChange() {
		//copy gui params into shader uniforms
		THREE.RipplesShader.uniforms.lineCount.value = vizParams.lineCount;
		//THREE.RipplesShader.uniforms.dotSize.value = vizParams.dotSize;
		//THREE.RipplesShader.uniforms.lineSize.value = vizParams.lineSize;
		THREE.RipplesShader.uniforms.blur.value = vizParams.blur;
		//THREE.RipplesShader.uniforms.depth.value = vizParams.depth;
		THREE.RipplesShader.uniforms.noiseSize.value = vizParams.noiseSize;

	}

	function update() {

		//draw every frame


		
		//uniforms[ "depth" ].value = vizParams.depth*AudioHandler.getVolume()*10;

		//not audio reactive
		//THREE.LineMaterialShader.uniforms[ "depth" ].value = vizParams.depth;

		//uniforms[ "depth" ].value = vizParams.depth*( 1 - BPMHandler.getBPMTime());


		//lerp rotate
		//var rotRng = Math.PI*2;
		//groupHolder.rotation.z = ATUtil.lerp(0,rotRng,(simplexNoise.noise(uniforms.noiseTime/5,0)+1)/2);

		//simple rotate
		groupHolder.rotation.z +=0.002;


		//AUTO LERP ALL PARAMS
		if (vizParams.auto){

			if (vizParams.vizMode == 0){
				vizParams.lineSize = simplexNoise.noise(VizHandler.getRenderTime()/4,0)/2 +.5;
				vizParams.dotSize = 0;

				
			}else if (vizParams.vizMode == 1){
				vizParams.dotSize = simplexNoise.noise(VizHandler.getRenderTime()/4,0)/2 +.5 + .5; //.5 - 1.5
				vizParams.lineSize = 0;
			}else{

				vizParams.lineSize = simplexNoise.noise(VizHandler.getRenderTime()/4,0)/2 +.5;
				vizParams.dotSize = 1 - vizParams.lineSize;

			}

			//vizParams.lineSize = 1 - vizParams.dotSize ;//simplexNoise.noise(VizHandler.getRenderTime()/4,10)/2 +.5;
			vizParams.depth = ATUtil.lerp(simplexNoise.noise(VizHandler.getRenderTime()/4,10)/2 +.5,0,600);
			vizParams.blur = ATUtil.lerp(simplexNoise.noise(VizHandler.getRenderTime()/4,20)/2 +.5,0,0.5);

			vizParams.noiseSpeed = ATUtil.lerp(simplexNoise.noise(VizHandler.getRenderTime()/4,30)/2 +.5,0,10);
			vizParams.noiseSize = ATUtil.lerp(simplexNoise.noise(VizHandler.getRenderTime()/4,40)/2 +.5,0,7);
			vizParams.lineSpeed = ATUtil.lerp(simplexNoise.noise(VizHandler.getRenderTime()/4,50)/2 +.5,0,1);
		}

		THREE.RipplesShader.uniforms.noiseTime.value += vizParams.noiseSpeed/1000;//delta/4;
		THREE.RipplesShader.uniforms.lineTime.value +=vizParams.lineSpeed/1000;//delta/4;

		//audio reactive
		THREE.RipplesShader.uniforms.dotSize.value = vizParams.dotSize * AudioHandler.getVolume();//delta/4;
		THREE.RipplesShader.uniforms.lineSize.value = vizParams.lineSize * AudioHandler.getVolume();//delta/4;
		THREE.RipplesShader.uniforms.depth.value = vizParams.depth*AudioHandler.getSmoothedVolume()*2;


	}

	function onBeat(){

		//beat detected

		//jump ripple posn
		THREE.RipplesShader.uniforms.noiseTime.value = Math.random()*10;

		if(vizParams.auto && Math.random() < 0.5 ){//AudioHandler.getVolume()){
			vizParams.lineCount = ATUtil.randomInt(10,80);
			vizParams.vizMode = ATUtil.randomInt(0,1);
			//vizParams.showDots = Math.random()<.5;
			onParamsChange();
		}

	}

	function onBPMBeat(){
		//bpm
	}

	return {
		init:init,
		update:update,
		onBeat:onBeat,
		onBPMBeat:onBPMBeat
	};

}();
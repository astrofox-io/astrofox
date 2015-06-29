var Eclipse = function() {

	//Viz Template

	var groupHolder;

	var vizParams = {
		on:false,
		brightness: 5.0,
		size: 1,
		// lineSize: 0.1,
		// blur: 0.1,
		// noiseSpeed: 10,
		// noiseSize: 4,
		// lineSpeed: 1,
		// depth:80
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
		var folder = ControlsHandler.getVizFolder().addFolder('Eclipse');
		folder.add(vizParams, 'on').onChange(onToggleViz);

		folder.add(vizParams, 'brightness', 0, 10).onChange(onParamsChange);
		folder.add(vizParams, 'size', 0, 6).onChange(onParamsChange);
		// folder.add(vizParams, 'dotSize', 0, 1).onChange(onParamsChange);
		// folder.add(vizParams, 'lineSize', 0, 1).onChange(onParamsChange);
		// folder.add(vizParams, 'blur', 0.01, 0.5).onChange(onParamsChange);
		// folder.add(vizParams, 'noiseSpeed', 0, 50).onChange(onParamsChange);
		// folder.add(vizParams, 'noiseSize', 0, 10).onChange(onParamsChange);
		// folder.add(vizParams, 'lineSpeed', 0, 5).onChange(onParamsChange);
		// folder.add(vizParams, 'depth', 0, 600).onChange(onParamsChange);
		//folder.open();

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

				uniforms: 		THREE.EclipseShader.uniforms,
				vertexShader:  	THREE.EclipseShader.vertexShader,
				fragmentShader: THREE.EclipseShader.fragmentShader,
				depthTest: false,
				
				//side: THREE.DoubleSide,
				blending: THREE.AdditiveBlending,
				transparent: true

			} );


			//Add  plane
			var planeGeometry = new THREE.PlaneGeometry( 800, 800,120,120 );
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
		//THREE.EclipseShader.uniforms.lineCount.value = vizParams.lineCount;
		//THREE.EclipseShader.uniforms.dotSize.value = vizParams.dotSize;
		//THREE.EclipseShader.uniforms.lineSize.value = vizParams.lineSize;
		//THREE.EclipseShader.uniforms.blur.value = vizParams.blur;
		//THREE.EclipseShader.uniforms.depth.value = vizParams.depth;
		//THREE.EclipseShader.uniforms.noiseSize.value = vizParams.noiseSize;

	}

	function update() {

		//draw every frame


		// THREE.EclipseShader.uniforms.noiseTime.value += vizParams.noiseSpeed/1000;//delta/4;
		// THREE.EclipseShader.uniforms.lineTime.value +=vizParams.lineSpeed/1000;//delta/4;

		// //audio reactive
		THREE.EclipseShader.uniforms.volume.value = vizParams.brightness * AudioHandler.getVolume();//delta/4;
		THREE.EclipseShader.uniforms.smoothedVolume.value = vizParams.size * AudioHandler.getSmoothedVolume();//delta/4;
		// THREE.EclipseShader.uniforms.lineSize.value = vizParams.lineSize * AudioHandler.getVolume();//delta/4;
		// THREE.EclipseShader.uniforms.depth.value = vizParams.depth*AudioHandler.getVolume()*5;

		//uniforms[ "depth" ].value = vizParams.depth*AudioHandler.getVolume()*10;

		//not audio reactive
		//THREE.LineMaterialShader.uniforms[ "depth" ].value = vizParams.depth;

		//uniforms[ "depth" ].value = vizParams.depth*( 1 - BPMHandler.getBPMTime());


		//lerp rotate
		//var rotRng = Math.PI*2;
		//groupHolder.rotation.z = ATUtil.lerp((simplexNoise.noise(uniforms.noiseTime/5,0)+1)/2,0,rotRng);


		groupHolder.rotation.z +=0.002;

	}

	function onBeat(){
		//beat detected
		//THREE.EclipseShader.uniforms.noiseTime.value = Math.random()*10;

		// if(Math.random() < AudioHandler.getVolume()){
		// 	THREE.EclipseShader.uniforms.lineCount.value = ATUtil.randomInt(10,50);
		// }

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
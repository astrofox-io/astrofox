var ImageTunnel = function() {

	var ringGroup;
	var groupHolder;
	var material;
	var hue = 0;

	var shapeDistance = 800;
	var shapeCount = 20;

	var rendertime = 0;

	var textures = [];
	var imgCount = 6;

	var vizParams = {
		on:false,
		twist:0.1,
		distance: 400
		//freakout:false
	};

	var RING_COUNT = 16;
	var RING_SEP = 300;
	var radius = 500;

	function init(){

		//INIT CONTROLS
		var folder = ControlsHandler.getVizFolder().addFolder('ImageTunnel');
		folder.add(vizParams, 'on').onChange(onToggleViz);
		//folder.add(vizParams, 'freakout');
		folder.add(vizParams, 'twist', 0, 1).name("twist").onChange(onParamsChange);
		folder.add(vizParams, 'distance', 20, 1000).name("distance").onChange(onParamsChange);
		//folder.open();
		onToggleViz();
	}


	function onToggleViz(){


		if (vizParams.on){

			//EVENT HANDLERS
			events.on("update", update);
			events.on("onBeat", onBeat);
			events.on("onBPMBeat", onBPMBeat);


			//init image textures

			for (var i = 0; i <imgCount; i++) {
				textures[i] = THREE.ImageUtils.loadTexture( "../res/img/flasher/" + i + ".png" );
			};


			groupHolder = new THREE.Object3D();
			VizHandler.getVizHolder().add(groupHolder);

			ringGroup = new THREE.Object3D();
			groupHolder.add(ringGroup);


			var hue = Math.random();
			materials = [];
			rings = [];
			seed = Math.random();

			var planeGeometry = new THREE.PlaneGeometry( 800, 600,1,1 );

			//multi rings
			for ( var i = 0; i < RING_COUNT; i ++ ) {

				//lerped
				hue = Math.abs(simplexNoise.noise(i/RING_COUNT,seed));
				var col = new THREE.Color();
				col.setHSL(hue, .8,.5);

				var material = new THREE.MeshBasicMaterial( {
					map : textures[0],
					transparent:true,
					//color: col,
					blending: THREE.AdditiveBlending,
					side: THREE.DoubleSide
				} );

				materials.push(material);

				//Add img plane
				var plane = new THREE.Mesh( planeGeometry, material );
				ringGroup.add( plane );
				plane.position.z =  i * RING_SEP;

				console.log(plane.position.z);
				//plane.position.x = Math.random()*30;//- i * RING_SEP - 1000;
				//plane.position.y = Math.random()*30;//- i * RING_SEP - 1000;
				//plane.scale.x = plane.scale.y = 3;
				//rings.push(plane);


			}

			//debug
			var dmat = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
			var dgeom = new THREE.CubeGeometry( 100, 100, 100 );
			var debugCube = new THREE.Mesh( dgeom, dmat );
			ringGroup.add( debugCube );

			onParamsChange();

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


	function onParamsChange(){


		for ( var i = 0; i < RING_COUNT; i ++ ) {
			ringGroup.children[i].rotation.z = i*vizParams.twist * Math.PI/2;
			ringGroup.children[i].position.z = i * vizParams.distance;
		}


	}

	function update() {

		rendertime +=.005;


		// groupHolder.rotation.z = (simplexNoise.noise(rendertime/4,456)+1)/2 * Math.PI*2;

		// linegroup.rotation.z = - BPMHandler.getBPMTime()*vizParams.twist * Math.PI/2;
		// //trace(bpmTime);
		// linegroup.position.z = BPMHandler.getBPMTime()*vizParams.distance;

		// hue = (simplexNoise.noise(rendertime/2,456)+1)/2;
		// material.color.setHSL(hue, 0.8,0.5);
		//material.color.setHSL(hue, 1.0, 0.0);


		ringGroup.position.z = BPMHandler.getBPMTime()*RING_SEP;
		ringGroup.rotation.z +=0.002;
		//move around shadows


		// ringGroup.rotation.z = - BPMHandler.getBPMTime()*0.1 * Math.PI/2;
		// shadowGroup.rotation.z = - BPMHandler.getBPMTime()*0.1 * Math.PI/2;



	}

	function onBeat(){
		//beat detected

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
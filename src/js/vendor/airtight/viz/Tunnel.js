var Tunnel = function() {

	var linegroup;
	var groupHolder;
	var material;
	var hue = 0;

	var shapeDistance = 800;
	var shapeCount = 20;

	var rendertime = 0;

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
		var folder = ControlsHandler.getVizFolder().addFolder('Tunnel');
		folder.add(vizParams, 'on').onChange(onToggleViz);
		//folder.add(vizParams, 'freakout');
		folder.add(vizParams, 'twist', 0, 1).name("twist").onChange(onParamsChange);
		folder.add(vizParams, 'distance', 100, 1000).name("distance").onChange(onParamsChange);
		//folder.open();
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

			material = new THREE.LineBasicMaterial( { color: 0xff0000, opacity: 1, linewidth:10} );

			//TODO - add triangles + circs

			//onBeat - add extra white shape

			//square
			// var squareGeom = new THREE.Geometry();
			// var size = 100;
			// squareGeom.vertices.push(new THREE.Vector3(-size,-size,0));
			// squareGeom.vertices.push(new THREE.Vector3(size,-size,0));
			// squareGeom.vertices.push(new THREE.Vector3(size,size,0));
			// squareGeom.vertices.push(new THREE.Vector3(-size,size,0));
			// squareGeom.vertices.push(new THREE.Vector3(-size,-size,0));

			// groupHolder = new THREE.Object3D();
			// VizHandler.getVizHolder().add(groupHolder);
			// linegroup= new THREE.Object3D();
			// groupHolder.add(linegroup);

			// for ( var i = 0; i < shapeCount; i ++ ) {
			// 	var line = new THREE.Line( squareGeom, material );
			// 	line.scale.x = line.scale.y = line.scale.z =  4;
			// 	line.position.z = - i * vizParams.distance + (shapeCount * vizParams.distance)/2;
			// 	linegroup.add( line );
			// 	line.rotation.z = i*.1 * Math.PI/2;
			// }

			//MAKE RINGS

			//RING_COUNT = 16;

			ringGroup = new THREE.Object3D();
			groupHolder.add(ringGroup);

			shadowGroup = new THREE.Object3D();
			ringGroup.add(shadowGroup);


			var hue = Math.random();
			materials = [];
			rings = [];
			seed = Math.random();

			//shadow mat
			var shadowMaterial = new THREE.MeshBasicMaterial( {
				color: 0x000000,
				transparent:true,
				opacity:.5
			} );

			var ringGeometry = new THREE.RingGeometry( radius*.95,radius, 48,1, 0, Math.PI*2) ;

			//multi rings
			for ( var i = 0; i < RING_COUNT; i ++ ) {

				//lerped
				hue = Math.abs(simplexNoise.noise(i/RING_COUNT,seed));
				var col = new THREE.Color();
				col.setHSL(hue, .8,.5);

				// if (Math.random() < 0.1){
				// 	col.setHSL((1 - hue)%1, Math.random(),.5);
				// }

				//NICE RAINBOW
				//col.setHSL(i/RING_COUNT,1 , .5);

				//B & W
				// if (i % 2 == 0){
				// 	col = new THREE.Color(0xFFFFFF);
				// }else{
				// 	col = new THREE.Color(0x000000);
				// }

				var material = new THREE.MeshBasicMaterial( {
					color: col,
					//map: img
					//wireframe:true
				} );

				materials.push(materials);

				//add shadow
				var shadow = new THREE.Mesh( ringGeometry, shadowMaterial );
				shadow.position.z = - i * RING_SEP + 5;
				//shadow.rotation.z = i*.1 * Math.PI/2;

				shadowGroup.add( shadow );

				//add ring
				var ring = new THREE.Mesh( ringGeometry, material );
				ring.position.z = - i * RING_SEP;
				ringGroup.add( ring );
				rings.push(ring);

				//ring.rotation.z = i*.1 * Math.PI/2;


			}

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


		// for ( var i = 0; i < shapeCount; i ++ ) {
		// 	linegroup.children[i].rotation.z = i*vizParams.twist * Math.PI/2;
		// 	linegroup.children[i].position.z = - i * vizParams.distance+ 2000;
		// }


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


		ringGroup.position.z = (BPMHandler.getBPMTime() + 2 )*RING_SEP;
		ringGroup.rotation.z +=0.002;
		//move around shadows


		// ringGroup.rotation.z = - BPMHandler.getBPMTime()*0.1 * Math.PI/2;
		// shadowGroup.rotation.z = - BPMHandler.getBPMTime()*0.1 * Math.PI/2;

		var maxShift = 30;
		shadowGroup.position.x = simplexNoise.noise(rendertime,seed)*maxShift;
		shadowGroup.position.y = simplexNoise.noise(rendertime,seed + 50)*maxShift;



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
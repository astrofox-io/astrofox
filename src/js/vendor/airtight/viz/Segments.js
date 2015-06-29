var Segments = function() {

	//Viz Template

	var groupHolder;

	var segments;
	var strobeFrame = 0;

	var smoothedScale = 1;
	var gotoScale = 1;

	var rotOffset = 0;

	var SEGMENT_COUNT = 60;


	var segMaterial;

	var vizParams = {
		on:false,
		useAudio:true,
		scale:1,
		//scale:1,
		strobe:false
	};

	function init(){

		//INIT CONTROLS
		var folder = ControlsHandler.getVizFolder().addFolder('Segments');
		folder.add(vizParams, 'on').onChange(onToggleViz);
		folder.add(vizParams, 'useAudio');
		folder.add(vizParams, 'scale', 0, 10).step(0.1).name("Size");
		folder.add(vizParams, 'strobe');
		//folder.add(vizParams, 'scale', 0, 10).step(0.1).name("Size");
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


			segments =[];

			//one material for all segments
			segMaterial = new THREE.MeshNormalMaterial({
				//color: Math.random()*0xFFFFFF,
				transparent: true,
				side: THREE.DoubleSide,
				blending : THREE.AdditiveBlending,
				opacity:ATUtil.randomRange(0.2,0.6),
				//vertexColors: THREE.FaceColors,
				//shading: THREE.FlatShading
				//map:texture
				//wireframe: true
			});



			//add segments
			for (var i = 0; i < SEGMENT_COUNT; i++) {
				var  s = new Segment(i,segMaterial);
				s.init();
				segments.push(s);
				groupHolder.add(s.center);
			};

			//origin box
			// var debugMaterial = new THREE.MeshBasicMaterial( {
			// 	color: 0xffffff,
			// 	wireframe: true,
			// 	blending : THREE.AdditiveBlending,
			// 	transparent:true,
			// 	opacity: 0.5
			// } );
			// var debugGeometry = new THREE.CubeGeometry( 50, 50, 50 );
			// var debugMesh = new THREE.Mesh( debugGeometry, debugMaterial );
			// groupHolder.add( debugMesh );


			//add geom planes
			// var imgTextureStars = THREE.ImageUtils.loadTexture( "../res/img/crosses2.png" );
			// imgTextureStars.wrapS = imgTextureStars.wrapT = THREE.RepeatWrapping;
			// imgTextureStars.repeat.set( 15, 15 );

			// var imgMaterial = new THREE.MeshBasicMaterial( {
			// 	map : imgTextureStars,
			// 	transparent:true,
			// 	side: THREE.DoubleSide,
			// 	blending: THREE.AdditiveBlending,
			// 	opacity:0.9,
			// 	depthTest:false
			// } );

			// //Add img plane
			// var planeGeometry = new THREE.PlaneGeometry( 1000, 1000,10,10 );
			// var plane = new THREE.Mesh( planeGeometry, imgMaterial );
			// groupHolder.add( plane );
			// plane.scale.x = plane.scale.y = plane.scale.z = 4;



			// var plane2 = new THREE.Mesh( planeGeometry, imgMaterial );
			// groupHolder.add( plane2 );
			// plane2.rotation.x = Math.PI/2;
			// plane2.scale.x = plane2.scale.y = plane2.scale.z = 4;

		//plane.scale.x = plane.scale.y = 3;







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

	function update() {

		//draw every frame

		//UPDATE TWEETS
		for (var i = 0; i < SEGMENT_COUNT; i++) {
			segments[i].update();
		}

		//perlin wobble floor texture
		// textureFloor.offset.x = snoise.noise(wtime * 0.001,0) *.5;
		// //tornado motion via floor motion
		// textureFloor.offset.y -= 0.02;
		// textureFloor.needsUpdate	= true;


		//groupHolder.rotation.x = simplexNoise.noise( VizHandler.getRenderTime()*.1 + rotOffset,0) * Math.PI*2;
		//groupHolder.rotation.y = simplexNoise.noise(VizHandler.getRenderTime()*.1 + rotOffset,10) * Math.PI*2;


		//groupHolder.scale.x = groupHolder.scale.y = groupHolder.scale.z = vizParams.scale;



		//strobe
		if (vizParams.strobe){

			strobeFrame ++;
			strobeFrame = strobeFrame % 4;

			// trace(strobe);

			// //= !strobe;
			if (strobeFrame > 1) groupHolder.rotation.x += Math.PI;

		}


		if (vizParams.useAudio){


			//gotoScale = (0.6 + (AudioHandler.getVolume()*0.4)) * vizParams.scale;

		}else{

			//move around randomly
			if (Math.random()< 0.004){
				gotoScale = ATUtil.randomRange(2,8);
			}

			//jump rot
			if (Math.random()< 0.003){
				groupHolder.rotation.x = Math.random()*Math.PI*2;
			}

			if (Math.random()< 0.005){
				 for (var i = 0; i < SEGMENT_COUNT; i++) {
		 			segments[i].setScale();
		 		}
			}


			// if (Math.random()< 0.05){
			// 	VizHandler.getCamera().fov = ATUtil.randomRange(50,120);
			// 	VizHandler.getCamera().updateProjectionMatrix();
			// }

		}

		smoothedScale += (gotoScale - smoothedScale)/15;
		groupHolder.scale.x = groupHolder.scale.y = groupHolder.scale.z = smoothedScale;



	}

	function onBeat(){
		//beat detected

		//if (Math.random() < .5) return;

		rotOffset = Math.random()*10;


		//if (Math.random()< 0.003){
		groupHolder.rotation.x = Math.random()*Math.PI*2;


		if (Math.random()< 0.3){
			gotoScale = ATUtil.randomRange(2,8);
		}
		//}


		 for (var i = 0; i < SEGMENT_COUNT; i++) {
		 	segments[i].setScale();
		 }

		 VizHandler.getCamera().fov = ATUtil.randomRange(50,120);
		VizHandler.getCamera().updateProjectionMatrix();



	}

	function onBPMBeat(){
		//bpm

		// for (var i = 0; i < SEGMENT_COUNT; i++) {
		// 	segments[i].setScale();
		// }
	}

	return {
		init:init,
		update:update,
		onBeat:onBeat,
		onBPMBeat:onBPMBeat
	};

}();
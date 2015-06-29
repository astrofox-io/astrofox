//BEAT SHAPES 3

//pop up a hollow rect on sequenced beats
//like 5 seconds orange


//on curve w ring shapes

//try with camera

var BeatShapes5 =  function() {

	var groupHolder;
	var material;
	var shapeRadius = 100;
	var spaceRange = 800;

	var shapes = [];
	var shapesCount = 12;

	var curShapeId = 0;

	var SPREAD = 800;
	var radius = 10;

	var STAR_COUNT = 1000;
	var STAR_SIZE = 3;


	var CONTROL_COUNT = 6; //spline control points


	var cam;

	var splineCurve;

	var mover;

	function init(){




		cam = VizHandler.getCamera(); //hijack the main cam


		cam.position.z = 300;

		//init event listeners
		events.on("update", update);
		//events.on("onBeat", onBeat);
		events.on("looped", onAudioStart);

		//events.on("kick", showKick);
		//events.on("snare", showSnare);
		//events.on("clap", showClap);
		
		events.on("kick", showNewShape);
		events.on("snare", showNewShape);
		events.on("clap", showNewShape);
		events.on("synth", showNewShape);

		groupHolder = new THREE.Object3D();
		VizHandler.getVizHolder().add(groupHolder);


		//SKY
		var imgTextureStars = THREE.ImageUtils.loadTexture( "../res/img/sky7.jpg" );
		imgTextureStars.wrapS = imgTextureStars.wrapT = THREE.RepeatWrapping;
		imgTextureStars.repeat.set( 1,1);
		var backMaterial = new THREE.MeshBasicMaterial( {
				map:imgTextureStars,
				transparent:true,
				opacity:.1,
		} );

		var backMesh = new THREE.Mesh( new THREE.SphereGeometry( 1000, 16, 16 ), backMaterial  );
		backMesh.scale.x = -1;
		groupHolder.add( backMesh );


		//PARTICLES
		//bkgnd stars
		var imgStar = THREE.ImageUtils.loadTexture( "../res/img/dot.png" );
		var geomStars = new THREE.Geometry();
		matStar = new THREE.ParticleBasicMaterial( { 
				size: STAR_SIZE,
				map: imgStar,
				blending : THREE.AdditiveBlending,
				depthTest : false,
				transparent : true,
				opacity:.5,
			} );

		for ( var i = 0; i < STAR_COUNT; i ++ ) {
			var vertex = new THREE.Vector3();
			vertex.x = ATUtil.getRand(-SPREAD,SPREAD);
			vertex.y = ATUtil.getRand(-SPREAD,SPREAD);
			vertex.z = ATUtil.getRand(-SPREAD,SPREAD);
			geomStars.vertices.push( vertex );

		}

		particles = new THREE.ParticleSystem( geomStars, matStar );
		particles.sortParticles = false;
		groupHolder.add( particles );


		//crate a random spline
		
		var controlPoints = [];

		//random
		// for ( var i = 0; i < CONTROL_COUNT; i ++ ) {
		// 	var controlPos = new THREE.Vector3();
		// 	controlPos.x = ATUtil.getRand(-SPREAD,SPREAD);
		// 	controlPos.y = ATUtil.getRand(-SPREAD,SPREAD);
		// 	controlPos.z = ATUtil.getRand(-SPREAD,SPREAD);
		// 	controlPoints.push(controlPos);
		// }

		//incremental
		var ZSTEP = 100;
		var SIDESTEP = 50;
		var lastPos = new THREE.Vector3();
		for ( var i = 0; i < CONTROL_COUNT; i ++ ) {
			lastPos.x = ATUtil.getRand(-SIDESTEP,SIDESTEP);
			lastPos.y = ATUtil.getRand(-SIDESTEP,SIDESTEP);
			lastPos.z += ZSTEP;
			controlPoints.push(lastPos.clone());
		}

		splineCurve = new THREE.SplineCurve3(controlPoints);

		var pointCount = CONTROL_COUNT*10;
		var points = splineCurve.getPoints(pointCount);
		var pointsGeometry = new THREE.Geometry();
		pointsGeometry.vertices = points;


		//debug line
		// var line = new THREE.Line( pointsGeometry, new THREE.LineBasicMaterial( { color: 0xFF0000 } ) );
		// groupHolder.add( line );


		//RIBBONS

		RIBBON_COUNT = 1;

		for ( var i = 0; i < RIBBON_COUNT; i ++ ) {

			var tubeGeom = new THREE.TubeGeometry(splineCurve, pointCount * 2, .1, 2, false, true);
			var matTube = new THREE.MeshBasicMaterial( { 
				color: 0xFFFFFF,
				side: THREE.DoubleSide,
				transparent:true,
				opacity:.2,
				blending : THREE.AdditiveBlending,
				depthTest:false
			} );

			matTube.color.setHSL(i/RIBBON_COUNT, 1.0, 0.5);


			//perturb geom
			var len = tubeGeom.vertices.length;
			var MAX_PERTURB = 1;
			for(var j=0; j < len; j++) {
				 vertex = tubeGeom.vertices[j];
				// vertex.x += simplexNoise.noise3d(j/300  ,0 ,i*100) *MAX_PERTURB;
				// vertex.y += simplexNoise.noise3d(j/300  ,0 ,i*100) *MAX_PERTURB ;

				vertex.y -=1;
			}


			var tube = new THREE.Mesh( tubeGeom, matTube );
			groupHolder.add( tube );
			//tube.position.y = -5;		


			

		}



		//ADD RINGS
		//create popUps
		var gridDim = 4;

		//pre-add to line based on sequnce events

		var seq = SequenceHandler.getSequence();
		shapesCount = seq.length;

		//console.log(seq);

		songLength = SequenceHandler.getDuration();

		//shadow mat
		var shadowMaterial = new THREE.MeshBasicMaterial( { 
			color: 0x000000,
			transparent:true,
			opacity:.4,
			side: THREE.DoubleSide,
		} );



		var kickGeom = new THREE.RingGeometry( radius*.1,radius*.3, 5,1, 0, Math.PI*2) ; //pent
		var snareGeom = new THREE.RingGeometry( radius*.1,radius*.5, 4,1, 0, Math.PI*2) ; //square
		var clapGeom = new THREE.RingGeometry( radius*.1,radius*.5, 3,1, 0, Math.PI*2) ; //tri
		var synthGeom = new THREE.RingGeometry( radius*.1,radius*.11, 12,1, 0, Math.PI*2) ; //circ


		for (var i = 0; i < shapesCount;i++){


			var col = new THREE.Color();
			col.setHSL(Math.random(), .8,.5);

			var material = new THREE.MeshBasicMaterial( { 
				color: col,
				side: THREE.DoubleSide,
				transparent:true,
				opacity:.4,
			} );


			var elem = seq[i];

			var shape;

			if (elem.name === "kick"){
				shape = new THREE.Mesh( kickGeom, material );
				//material.color.setHSL(0, .8,.5);
			}else if (elem.name === "snare"){
				shape = new THREE.Mesh( snareGeom, material );
				//material.color.setHSL(.3, .8,.5);
			}else if (elem.name === "clap"){
				shape = new THREE.Mesh( clapGeom, material );
				//material.color.setHSL(.6, .8,.5);
			}else if (elem.name === "synth"){
				shape = new THREE.Mesh( synthGeom, material );
				//material.color.setHSL(.8, .8,.5);
			}



		


			
			groupHolder.add( shape );



			//add shadow
			var shadow = new THREE.Mesh( shape.geometry.clone(), shadowMaterial );
			//shadow.scale.x = shadow.scale.y = shadow.scale.z = 1.1; // shadow is a little larger
			shadow.position.z = -.1;
			//shadowGroup.position.x = snoise.noise(totalTime,seed)*maxShift;
			shadow.position.y = -.2;
			//mesh.position.y = 150;
			shape.add( shadow );



			var songPos = elem.start/songLength;
			shape.position = splineCurve.getPoint(songPos);
			shape.lookAt(splineCurve.getPoint(songPos + 0.0001));
			shapes.push(shape);
			//shape.scale.multiplyScalar(0.3);
		}

		//debug mover ring
		var geom = new THREE.RingGeometry ( 2, 6,3, 3 );
		var mat = new THREE.MeshBasicMaterial( { color: 0xFFFFFF,wireframe: true} );
		mover = new THREE.Mesh( geom, mat );
		mover.scale.multiplyScalar(.5);
		//groupHolder.add( mover );


		scl = 1;

	}

	function showNewShape() {

		var shape = shapes[curShapeId];
		//shapes[curShapeId].position.z = -200; //show hack
		//shapes[curShapeId].doPop();


		var gotoScale = 1.2;
		var popTime = 0.1;
		// //grow quick
		// TweenMax.to(shape.scale, popTime ,{x:gotoScale,y:gotoScale,z:gotoScale,ease:Expo.EaseOut} );
		// // //fade out
		// TweenMax.to(shape.scale, 1 ,{x:0.3,y:0.3,z:0.3,delay:popTime} );


		TweenMax.set(shape.material, {opacity:0.2} );
		TweenMax.to(shape.material, 0.1 ,{opacity:1} );
		//TweenMax.set(shape.material, {opacity:1} );
		TweenMax.to(shape.material, 0.2 ,{opacity:.4,delay:0.2} );



		curShapeId ++;
		if (curShapeId >= shapesCount) curShapeId = 0;

	}


	function update() {


		//track camera on line with song position
		var songPos = AudioHandler.getAudioTime()/songLength;
		mover.position = splineCurve.getPoint(songPos );
		mover.lookAt(splineCurve.getPoint(songPos + 0.001));

		//cam lags behind
		var camPos = Math.max(0,songPos - 0.01);
		cam.position = splineCurve.getPoint(camPos);
		//cam.position.y += .3;
		var lookAtPos = splineCurve.getPoint(camPos + 0.001)
		//lookAtPos.y += .3;
		cam.lookAt(lookAtPos);


		//scale to volume
		// for (var i = 0; i < shapesCount;i++){
		// 	var shape = shapes[i];
		// 	var gotoScale = AudioHandler.getVolume()*1.2 + .1;
		// 	scl += (gotoScale - scl)/3;
		// 	shape.scale.x = shape.scale.y = shape.scale.z = scl;
		// }




		// groupHolder.rotation.z += 0.01; 
		// var gotoScale = AudioHandler.getVolume()*1.2 + .1;
		// scl += (gotoScale - scl)/3;
		// groupHolder.scale.x = groupHolder.scale.y = groupHolder.scale.z = scl;
	}

	function onBeat(){
		showNewShape();
	}

	function onAudioStart(){

		console.log("onAudioStart");

		curShapeId = 0;

		for (var i = 0; i < shapesCount;i++){
			//shapes[i].position.z = 9999; //hide hack
		}
		
	}

	return {
		init:init,
	};

}();
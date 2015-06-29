var NeonShapes = function() {


	//80's neon flat shapes
	// randomly generated
	//timing based on fast beat detect
	//or BPM multiples

	//LATER
	//randomly deform shapes
	//toggle wireframe
	//shapes pop and get smaller

	var groupHolder;
	var material;

	var drewNewShape = false;

	var shapes = [];

	var scl = 0;

	function init(){

		//init event listeners
		events.on("update", update);
		events.on("onBeat", onBeat);

		//create geom for square, tri, circle

		//console.log("init");

		var radius = 1000;
		groupHolder = new THREE.Object3D();
		VizHandler.getVizHolder().add(groupHolder);

		//groupHolder.visible = false;

		//groupHolder.position.z = 200;

		material = new THREE.MeshBasicMaterial( { 
			color: 0xFFFFFF, 
			wireframe: false,
			//blending: THREE.AdditiveBlending,
			depthWrite:false,
			depthTest:false,
			transparent:true,
			opacity:1
		} );

		//square
		// var geometry = new THREE.PlaneGeometry( radius*2, radius*2 );
		// mesh = new THREE.Mesh( geometry, material );
		// groupHolder.add( mesh );
		// shapes.push(mesh);

		// //triangle
		// geometry = new THREE.TriangleGeometry ( radius ) ;
		// mesh = new THREE.Mesh( geometry, material );
		// groupHolder.add( mesh );
		// shapes.push(mesh);

		//RIGHT ANGLE triangle
		// geometry = new THREE.TriangleGeometry ( radius ) ;
		// triMesh = new THREE.Mesh( geometry, material );
		// groupHolder.add( triMesh );
		// triMesh.visible = false;
		// shapes.push(squareMesh);

		//1/2 circle
		// geometry = new THREE.CircleGeometry( radius, 30, 0, Math.PI ) ;
		// mesh = new THREE.Mesh( geometry, material );
		// groupHolder.add( mesh );
		// shapes.push(mesh);

		//FULL circle
		// geometry = new THREE.CircleGeometry( radius, 30, 0, Math.PI *2) ;
		// mesh = new THREE.Mesh( geometry, material );
		// groupHolder.add( mesh );
		// shapes.push(mesh);


		//empty square
		geometry = new THREE.RingGeometry( radius*.6,radius, 4,1, 0, Math.PI*2) ;
		mesh = new THREE.Mesh( geometry, material );
		groupHolder.add( mesh );
		shapes.push(mesh);


		//empty tri
		geometry = new THREE.RingGeometry( radius*.6,radius, 3,1, 0, Math.PI*2) ;
		mesh = new THREE.Mesh( geometry, material );
		groupHolder.add( mesh );
		shapes.push(mesh);

		//empty circ
		// geometry = new THREE.RingGeometry( radius*.6,radius, 24,1, 0, Math.PI*2) ;
		// mesh = new THREE.Mesh( geometry, material );
		// groupHolder.add( mesh );
		// shapes.push(mesh);


		shapesCount = shapes.length;

	}

	function drawNewShape() {

		

		//random color
		//hue = Math.random();
		//material.color.setHSL(hue, 0.8, 0.5);
		//material.color.setHSL(1, 0, .2);
		//material.color.setHSL(0, 0, 0);

		//random rotation
		groupHolder.rotation.z = Math.random()*Math.PI;

		//hide shapes
		for (var i = 0; i <= shapesCount-1;i++){
			//shapes[i].visible = false;
			//shapes[i].position.x = 0;
			//shapes[i].position.y = 0;
			shapes[i].rotation.y = Math.PI/2; //hiding by turning
		}

		//var range = 500;
		//shapes[r].position.x = ATUtil.getRand(-range,range);
		//shapes[r].position.y = ATUtil.getRand(-range,range);



		//show shape sometimes
		if (Math.random() < .5){
			var r = Math.floor(Math.random() * shapesCount);
			//console.log(r)
			shapes[r].rotation.y = Math.random()*Math.PI/4-Math.PI/8;
		}

		

		//show multiple shapes
		// var r = Math.floor(Math.random() * shapesCount);
		// var range = 500;
		// shapes[r].position.x = 1200;
		// //shapes[r].position.y = ATUtil.getRand(-range,range);
		// shapes[r].rotation.y = Math.random()*Math.PI/4-Math.PI/8; //hiding by turning
		// shapes[r].scale.x = groupHolder.scale.y = groupHolder.scale.z = .5;

		// var r = Math.floor(Math.random() * shapesCount);
		// var range = 500;
		// shapes[r].position.x = -1200;
		// //shapes[r].position.y = ATUtil.getRand(-range,range);
		// shapes[r].rotation.y = Math.random()*Math.PI/4-Math.PI/8; //hiding by turning
		// shapes[r].scale.x = groupHolder.scale.y = groupHolder.scale.z = .5;


	}

	function update() {

		//drawNewShape();

		groupHolder.rotation.z += 0.01; 

		var gotoScale = AudioHandler.getVolume()*1.2 + .1;

		scl += (gotoScale - scl)/3;

		groupHolder.scale.x = groupHolder.scale.y = groupHolder.scale.z = scl;


		//bpm mode
		// if (bpmTime < 0.5){
		// 	drawNewShape();
		// 	drewNewShape = true;

		// }

		

		// linegroup.rotation.z = - bpmTime*0.1 * Math.PI/2;
		// trace(bpmTime);
		// linegroup.position.z = bpmTime*shapeDistance;

	}

	function onBeat(){
		//console.log("Shapes.onBeat");
		drawNewShape();

	}

	function onBPMBeat(){
		//console.log("Shapes.onBPMBeat");
		//drawNewShape();

	}

	function show(doShow){
		//console.log("neon.show: " + doShow);
		//groupHolder.visible = doShow;
		groupHolder.traverse( function ( object ) { object.visible = doShow; } );
	}

	function toggleBPMMode(tog){
		console.log("PP");
	}

	return {
		init:init,
		update:update,
		onBeat:onBeat,
		onBPMBeat:onBPMBeat,
		show:show,
		toggleBPMMode:toggleBPMMode
	};

}();
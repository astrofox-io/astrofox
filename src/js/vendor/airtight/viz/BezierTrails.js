var BezierTrails = function() {

	//Viz Template

	var groupHolder;

	var head;
	var starCount = 45;
	var particleGeom;
	var lineGeom;
	var line2Geom;

	var curvePts = [];
	var beatTime = 0;

	var material;

	var gotoLeftSide = true;

	var ring;
	var triCount = 6;
	var tris;
	var triId = 0;

	var lineMaterial;


	//snow
	// var snowCount = 10;
	// var snowGeeom;

	var vizParams = {
		on:false,
		size: 5
		//scale:1,
		//freakout:false
	};

	function init(){

		//INIT CONTROLS
		var folder = ControlsHandler.getVizFolder().addFolder('Bezier Trail');
		folder.add(vizParams, 'on').onChange(onToggleViz);
		folder.add(vizParams, 'size', 0, 10).name("Size");
		//folder.add(vizParams, 'freakout');
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


			//groupHolder.scale.x = groupHolder.scale.y = groupHolder.scale.z = 0.3;

			//PARTICLES
			//init Particles
			//GLow for main line
			particleGeom = new THREE.Geometry();
			//create one shared material
			var sprite = THREE.ImageUtils.loadTexture("../res/img/particle.png");
			material = new THREE.ParticleBasicMaterial({
				size: 300,
				map: sprite,
				blending: THREE.AdditiveBlending,
				depthTest: false,
				transparent: true,
				opacity:.02,
				//sizeAttenuation: false,
				//vertexColors: true //allows 1 color per particle
				color: 0xFFFFFF
			});

			//create particles
			//var colors = [];
			for (i = 0; i < starCount; i++) {
				particleGeom.vertices.push(new THREE.Vector3());
				//lineGeom.vertices.push(new THREE.Vector3());

				//colors[i] = new THREE.Color();
				//colors[i].setHSL(Math.random(), 0.8, 0.5);

				// var star = {initPos: Math.random(),
				// 			theta: Math.random()*Math.PI*2,
				// 			phi: Math.random()*Math.PI*2,
				// 			};



				// stars.push(star);
			}

			//particleGeom.colors = colors;
			//lineGeom.colors = colors;


			//init particle systemvizParams.opacity;
			var particles = new THREE.ParticleSystem(particleGeom, material);
			particles.sortParticles = false;
			groupHolder.add(particles);

			//SNOW
			//init Particles
			// snowGeom = new THREE.Geometry();
			// //create one shared material
			// var sprite = THREE.ImageUtils.loadTexture("../res/img/particle.png");
			// var snowMaterial = new THREE.ParticleBasicMaterial({
			// 	size: 50,
			// 	map: sprite,
			// 	blending: THREE.AdditiveBlending,
			// 	depthTest: false,
			// 	transparent: true,
			// 	opacity:2,
			// 	//sizeAttenuation: false,
			// 	//vertexColors: true //allows 1 color per particle
			// 	color: 0xFFFFFF
			// });

			// //create particles
			// //var colors = [];
			// for (i = 0; i < snowCount; i++) {
			// 	snowGeom.vertices.push(new THREE.Vector3());
			// }

			// //init snow
			// var snow = new THREE.ParticleSystem(snowGeom, snowMaterial);
			// snow.sortParticles = false;
			// groupHolder.add(snow);



			//LINE
			lineGeom = particleGeom.clone();
			lineMaterial = new THREE.LineBasicMaterial( {
					color: 0xFFFFFF,
					linewidth: 5 ,
					opacity : .8,
					blending : THREE.AdditiveBlending,
					depthTest : false,
					transparent : true ,
					//vertexColors: true
				});

			var line = new THREE.Line(lineGeom, lineMaterial);
			groupHolder.add(line);


			//thickline
			line2Geom = particleGeom.clone();
			var line2Material = new THREE.LineBasicMaterial( {
					color: 0xFFF00F,
					linewidth: 10 ,
					opacity : .2,
					blending : THREE.AdditiveBlending,
					depthTest : false,
					transparent : true ,
					//vertexColors: true
				});

			var line2 = new THREE.Line(line2Geom, line2Material);
			groupHolder.add(line2);
			line2.position.x = 2;
			line2.position.y = 2;


			//console.log(line);


			//HEAD
			head = new THREE.Object3D();
			head.position = new THREE.Vector3();
			groupHolder.add(head);

			//WHITE CIRCLE
			var radius = 200;
			var thickness = 0.90;

			var ringMaterial = new THREE.MeshBasicMaterial( {
				color: 0xFFFFFF,
				wireframe: false,
				side: THREE.DoubleSide,
				blending: THREE.AdditiveBlending,
				depthWrite:false,
				depthTest:false,
				transparent:true,
				opacity:.9
			} );

			ringGeometry = new THREE.RingGeometry( radius*thickness,radius, 32,1, 0, Math.PI*2) ;
			ring = new THREE.Mesh( ringGeometry, ringMaterial );
			groupHolder.add( ring );


			//TRIANGLES
			tris =[];
			radius = 200;
			var triGeom = new THREE.RingGeometry( radius*.3,radius, 3,1, 0, Math.PI*2) ; //tri


			for (var i = 0; i < triCount;i++){
				var col = new THREE.Color();
				col.setHSL(Math.random(), .8,.5);
				var triMaterial = new THREE.MeshBasicMaterial( {
					color: col,
					side: THREE.DoubleSide,
					blending: THREE.AdditiveBlending,
					depthWrite:false,
					depthTest:false,
					transparent:true,
					opacity:.9
				} );

				var shape = new THREE.Mesh( triGeom, triMaterial );
				groupHolder.add( shape );
				tris.push(shape);
			}




		}else{

			//EVENT HANDLERS
			events.off("update", update);
			events.off("onBeat", onBeat);
			events.off("onBPMBeat", onBPMBeat);

			if (groupHolder){
				VizHandler.getVizHolder().remove(groupHolder);
				groupHolder = null;
				tris = null;
			}


		}

	}

	function update() {

		//draw every frame


		//groupHolder.rotation.y +=0.01;


		//beatTime += 1;

		//UberVizMain.trace(beatTime);

		//write latest head posn into curvePts array
		//curvePts[beatTime] = head.position;

		// curvePts.push(head.position);

		// for (i = 1 ; i < starCount - 1 ; i++) {
		// 	//if (i < beatTime){
		// 		//geometry.vertices[i] = head.position;//curvePts[curvePts.length - (i +1)];
		// 	//}
		// }


		particleGeom.vertices.pop();
		particleGeom.vertices.unshift(head.position.clone());
		particleGeom.verticesNeedUpdate = true;


		lineGeom.vertices.pop();
		lineGeom.vertices.unshift(head.position.clone());
		lineGeom.verticesNeedUpdate = true;

		line2Geom.vertices.pop();
		line2Geom.vertices.unshift(head.position.clone());
		line2Geom.verticesNeedUpdate = true;


		material.size = vizParams.size * 500 * (AudioHandler.getSmoothedVolume() + 0.2);


		//lineMaterial.linewidth = 30 * (AudioHandler.getSmoothedVolume() + 0.2);


		if (Math.random() < 0.05){
			popTri();
		}


		// if (Math.random() < 0.2){

		// 	var rng = 100;
		// 	var offset = new THREE.Vector3(ATUtil.randomRange(-rng,rng),
		// 		ATUtil.randomRange(-rng,rng),
		// 		ATUtil.randomRange(-rng,rng));

		// 	snowGeom.vertices.pop();
		// 	snowGeom.vertices.unshift(head.position.clone().add(offset));
		// 	snowGeom.verticesNeedUpdate = true;

		// }


	}

	function onBeat(){
		//beat detected

		//if (Math.random() < 0.2){

			//groupHolder.rotation.y = Math.random()*Math.PI*2;






		//}

		//popTri();

	}

	function popTri(){


		triId++;
		triId = triId % triCount;
		var t = tris[triId];
		t.position = head.position.clone();
		var scl = AudioHandler.getSmoothedVolume() + .5;
		TweenMax.fromTo(tris[triId].scale,BPMHandler.getBPMDuration()/1000,{x:0.01,y:0.01},{x:scl,y:scl,ease:Expo.easeOut});
		TweenMax.fromTo(tris[triId].material,BPMHandler.getBPMDuration()/1000,{opacity:1},{opacity:0});

		//TweenMax.fromTo(t.scale,BPMHandler.getBPMDuration()/1000,{x:1,y:1},{x:0.01,y:0.01,ease:Expo.easeOut});

		var rotRng = Math.PI/4;
		t.rotation.y = ATUtil.randomRange(-rotRng,rotRng);
		t.rotation.x = ATUtil.randomRange(-rotRng,rotRng);
		//TweenMax.fromTo(tris[triId].material,BPMHandler.getBPMDuration()/1000,{opacity:1},{opacity:0});

		t.material.color.setHSL(Math.random(), .8,.5);


	}


	function onBPMBeat(){

		//UberVizMain.trace(BPMHandler.getBPMDuration());

		//bpm
		//var range = 500;

		//beatTime = 0;

		//curvePts = [];

		// for (i = 1 ; i < starCount - 1 ; i++) {

		// 	geometry.vertices[i] = head.position;


		// }

		// geometry.verticesNeedUpdate = true;

		// head.position.x = Math.random() * 500;
		// head.position.y = Math.random() * 500;

		///////////////
		//dance left to right
		var range = 500;
		gotoLeftSide = !gotoLeftSide;
		gotoTopSide = !gotoLeftSide;

		var xpos = (gotoLeftSide ? range : -range )+ ATUtil.randomRange(-100,100)

		var gotoPosn = new THREE.Vector3(xpos,
			ATUtil.randomRange(-range,range),
			ATUtil.randomRange(-200,0));

		range = 200;
		var cpPosn = gotoPosn.clone().add(new THREE.Vector3(ATUtil.randomRange(-range,range),
			ATUtil.randomRange(-range,range),
			0));
		/////////////


		//Stay in bottom left 1/4 for tiling
		//x: -900 -> -450
		//y: -700 -> -350

		// var gotoPosn = new THREE.Vector3(ATUtil.randomRange(-900,-450),
		// 	ATUtil.randomRange(-700,-350),0);

		// range = 200;
		// var cpPosn = gotoPosn.clone().add(new THREE.Vector3(ATUtil.randomRange(-range,range),
		// 	ATUtil.randomRange(-range,range),
		// 	0));
		/////////////


		///////////////
		//dance top to bottom on left for mirror
		// var range = 500;
		// gotoLeftSide = !gotoLeftSide;
		// gotoTopSide = !gotoLeftSide;

		// var xpos = (gotoLeftSide ? range : -range )+ ATUtil.randomRange(-100,100)

		// var gotoPosn = new THREE.Vector3(xpos,
		// 	ATUtil.randomRange(-range,range),
		// 	ATUtil.randomRange(-200,0));

		// range = 200;
		// var cpPosn = gotoPosn.clone().add(new THREE.Vector3(ATUtil.randomRange(-range,range),
		// 	ATUtil.randomRange(-range,range),
		// 	0));
		/////////////

		TweenMax.to(head.position, BPMHandler.getBPMDuration()/1000, {bezier:[{x:cpPosn.x,
			y:cpPosn.y,
			z:cpPosn.z},
			{x:gotoPosn.x,
				y:gotoPosn.y,
				z:gotoPosn.z}]});

		// TweenMax.to(head.position, BPMHandler.getBPMDuration()/1000, {x:gotoPosn.x,
		// 		y:gotoPosn.y,
		// 		z:gotoPosn.z, ease: Expo.easeIn});


		ring.position = head.position.clone();
		TweenMax.fromTo(ring.scale,BPMHandler.getBPMDuration()/1000,{x:0,y:0},{x:1,y:1,ease:Expo.easeOut});
		TweenMax.fromTo(ring.material,BPMHandler.getBPMDuration()/1000,{opacity:1},{opacity:0});

		//pop and shrink
		//TweenMax.fromTo(ring.scale,BPMHandler.getBPMDuration()/1000,{x:1,y:1},{x:0.01,y:0.01,ease:Expo.easeIn});





}

return {
	init:init,
	update:update,
	onBeat:onBeat,
	onBPMBeat:onBPMBeat
};

}();
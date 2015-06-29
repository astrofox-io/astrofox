/**
 * Segment Object
 */

 //var colors = [0x732946,0x9a355d,0xbf4373,0x9b9b9b,0xb4b4b4];


var colors = [0x2e4080,0x352e85,0x512e89,0x702f8e,0x912f93];


var Segment = function(index,segMaterial) {

	this.init = function() {

		//center is the center point of tweet segmnent
		//tweet plane spins around center
		this.center = new THREE.Object3D();
		//this.center.rotation.y = ATUtil.randomRange(0,Math.PI*2);
		this.noiseStart = Math.random() * 100;
		this.speed = ATUtil.randomRange(0.01,0.05);
		if (Math.random()>.5) this.speed = -this.speed;
		this.age = 0;

		//assign random freq to listen to
		this.binId = ATUtil.randomInt(0,15);
		this.smoothedScale = 1;
		this.gotoScale = 1;



		//start behind camera
		//outerRadius is distance between edge of tornado and
		this.center.rotation.y = -Math.PI/2
		this.outerRadius= 0;



		var thickness = 150;
		var radius = 400+ ATUtil.randomRange(-thickness,thickness);

		//console.log(radius);

		var planeGeometry = new THREE.SphereGeometry(radius, 30, 1,
			ATUtil.randomRange(0,Math.PI*2),
			ATUtil.randomRange(Math.PI/4,Math.PI), //Math.PI/2, //horiz width
			ATUtil.randomRange(Math.PI/16,Math.PI*15/16 ),//Math.PI/2, //vertical start
			ATUtil.randomRange(Math.PI/48,Math.PI/16) //Math.PI/16 //vertical width
			)


		//Init Material-


		//GOOD
		// this.material = new THREE.MeshNormalMaterial({
		// 	//color: Math.random()*0xFFFFFF,
		// 	transparent: true,
		// 	side: THREE.DoubleSide,
		// 	blending : THREE.AdditiveBlending,
		// 	opacity:ATUtil.randomRange(0.2,0.6),
		// 	//vertexColors: THREE.FaceColors,
		// 	//shading: THREE.FlatShading
		// 	//map:texture
		// });

		//STRIPEY
		// this.material = new THREE.MeshBasicMaterial({
		// 	//color: Math.random()*0xFFFFFF,
		// 	transparent: true,
		// 	side: THREE.DoubleSide,
		// 	blending : THREE.AdditiveBlending,
		// 	opacity:ATUtil.randomRange(0.2,0.6),
		// 	vertexColors: THREE.FaceColors,
		// 	//shading: THREE.FlatShading
		// 	//map:texture
		// });
		// var thiscol = new THREE.Color();
		// thiscol.setHSL(Math.random(),.8,.5);
		// var black = new THREE.Color(0x000000);

		// for (var i = 0; i < planeGeometry.faces.length; i++) {
		// 	var col = (i % 4 > 1) ? thiscol : black;
		// 	planeGeometry.faces[i].color = new THREE.Color(col);
		// }

		//this.material.color.setHSL(Math.random(),.8,.5);


		//WOBBLY
		// this.material = new THREE.ShaderMaterial({
		// 	uniforms:{
		// 		diffuse : { type: "c", value: new THREE.Color( 0xeeeeee ) },
		// 		opacity : { type: "f", value: 1.0 },
		// 		noiseTime: { type: "f", value: Math.random() },
		// 		noiseScale: { type: "f", value: 500},
		// 		depth: { type: "f", value: 0 },

		// 	},

		// 	vertexShader:document.getElementById('vertexShader').textContent,
		// 	fragmentShader:document.getElementById('fragmentShader').textContent,
		// 	color:Math.random()*0xFFFFFF,
		// 	transparent: true,
		// 	side: THREE.DoubleSide,
		// 	blending : THREE.AdditiveBlending,
		// 	opacity:.5,

		// });

		//console.log(this.material);

		//this.material.uniforms.diffuse.value.setHSL(Math.random()*.4 + .3,.8,.5);
		//this.material.uniforms['diffuse'].value.setHSL(Math.random(),1,.5);



		this.plane = new THREE.Mesh(planeGeometry,segMaterial);
		this.center.add( this.plane );
		//face center
		//this.plane.rotation.y = Math.PI/2;


		//this.plane.position.x = 10000;//hide at start


		//DEBUG
		// var debugGeom = new THREE.BoxGeometry( 20, 20, 20 );
		// var debugMaterial = new THREE.MeshBasicMaterial( {
		// 	color: 0x00ff00,
		// 	wireframe: true,
		// 	blending : THREE.AdditiveBlending,
		// 	transparent:true
		// } );

		// //center orig
		// var debugMesh = new THREE.Mesh( debugGeom, debugMaterial );
		// this.center.add( debugMesh );

		// //plane orig
		// var debugMesh2 = new THREE.Mesh( debugGeom, debugMaterial );
		// this.plane.add( debugMesh2 );

	//	TweenMax.delayedCall(Math.random()*10 , this.reset,null,this);

	},

	this.setScale = function(){

		//if (Math.random() < .5) return;
		this.gotoScale = ATUtil.randomRange(0.4,1);


	},

	//send plane back to edge of screen for re-entry
	this.reset = function(){

		//start close to camera
		//this.center.rotation.y = -Math.PI/2 + ATUtil.randomRange(-Math.PI/6,Math.PI/6);

		//TweenMax.killTweensOf(this);
		//TweenMax.fromTo(this,6, { outerRadius: 1000}, {outerRadius:0,ease:Circ.easeOut,delay:Math.random()*10 + 1});
		//TweenMax.fromTo(this,6, { outerRadius: 1000}, {outerRadius:0,ease:Circ.easeOut});
		//this.age = 0;
	},

	this.update = function() {

		//console.log("update");


		//howInside = how close to being in tornado
		//var clmp = ATUtil.clamp(this.outerRadius,0,300);
		//var howInside =  ATUtil.map(clmp,300,0,0,1);

		//this.plane.material.uniforms.noiseTime.value += 0.01;


		// this.material.uniforms.diffuse.value.setHSL(
		// 	(snoise.noise((this.noiseStart + wtime*0.003),0) + 1 )/2
		// 	,1,.5);



		//this.plane.material.uniforms['time'].value += 0.01;




		//lerp tweets up and down pole
		//vpos = normalized vertical position of tweet along height of column 0-1 (1 is top)

		//this.vpos = (snoise.noise(this.noiseStart + wtime*0.001,0) + 1 )/2;
		//this.center.position.y = this.vpos* TORNADO_H;
		//lower spins faster
		//this.rotSpeed = ( ATUtil.lerp(this.vpos, 0.1, 0.02) + this.speed) * howInside;

		//var scl = 0.5 + (snoise.noise((this.noiseStart + wtime) * 0.006,0) +1)/4;
		//this.plane.scale.set(scl,scl,scl);

		//smaller radius at bottom
		//this.plane.position.x = ATUtil.lerp(this.vpos,BOTTOM_RAD,TOP_RAD) + this.outerRadius;


		//spin
		this.center.rotation.y += this.speed;


		 // var lvl = AudioHandler.getLevelsData()[this.binId];
		 // if (lvl > 0){
		 // 	var gotoScale = 0.2 + lvl ;
		 // 	this.smoothedScale += (gotoScale - this.smoothedScale)/5;
		 // 	//console.log( AudioHandler.getLevelsData()[this.binId]);
		 // 	this.center.scale.x = this.center.scale.y = this.center.scale.z = this.smoothedScale;
		 // }


		 this.smoothedScale += (this.gotoScale - this.smoothedScale)/8;
		 //console.log( AudioHandler.getLevelsData()[this.binId]);
		 this.center.scale.x = this.center.scale.y = this.center.scale.z = this.smoothedScale;




		//lerp  other axis
		//this.center.rotation.x = snoise.noise((this.noiseStart + wtime) * 0.003,0) * Math.PI*2;


		//do a sinous wobble along spine of tornado
		//this.center.position.x =  snoise.noise((this.center.position.y/2 + wtime) * 0.003,0) * 100;



		// this.age++;

		// if (this.age > 500  && Math.random()< 0.0002){
		// 	this.reset();
		// }

	}
};

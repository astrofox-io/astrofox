var StarBars = function() {



	var vizParams = {
		on:false,
		size: 5,
		speed: 5,
		opacity: 0.7,
		colorRange: .5,

	};

	var PARTICLE_ROT_SPEED = 0.01;
	var BEAM_ROT_SPEED = 0.003;

	var starCount = 300;
	var starRadius = 2000;
	var stars = [];
	var colors = [];

	var starSize = 0;

	var geometry;

	var material;
	var particleHue;

	var posTime = 0;

	var beamCount = 40;

	var groupHolder;

	function init(){

		//INIT CONTROLS
		var folder = ControlsHandler.getVizFolder().addFolder('StarBars');
		folder.add(vizParams, 'on').onChange(onToggleViz);
		//folder.add(vizParams, 'size', 0, 10).name("Size");
		folder.add(vizParams, 'speed', -10, 10).name("Speed");
		//folder.add(vizParams, 'opacity', 0, 1).name("Opacity");
		//folder.add(vizParams, 'colorRange', 0, 1).step(0.1).name("Color Range");
		//folder.add(vizParams, 'freakout');
		//folder.open();
		onToggleViz();



	}


	function onToggleViz(){


		if (vizParams.on){

			groupHolder = new THREE.Object3D();
			VizHandler.getVizHolder().add(groupHolder);

			//PARTICLES
			//init Particles
			geometry = new THREE.Geometry();
			//create one shared material
			material = new THREE.MeshBasicMaterial({
				color: 0x0FFFFFF,
				blending: THREE.AdditiveBlending,
				depthTest: false,
				transparent: true,
				opacity:.8,
				sizeAttenuation: true
			});


			var width = 4;
			//var lengthMin = 20
			//var lengthRange = 80;

			//create bars
			var spread =  1000;

			var cylinderGeom = new THREE.CylinderGeometry(width,width,100,12,12,false);

			for (i = 0; i < starCount; i++) {





				var star = new THREE.Mesh( cylinderGeom, material );

				star.scale.y = ATUtil.randomRange(0.2,1);

				star.initPos = Math.random();
				groupHolder.add( star );

				star.rotation.x = Math.PI/2;

				star.position = new THREE.Vector3(ATUtil.randomRange(-spread,spread),
				ATUtil.randomRange(-spread,spread),
				0);

				stars.push(star);

			}

			//geometry.colors = colors;






			//init event listeners
			events.on("update", update);
			events.on("onBeat", onBeat);

		}else{

			if (groupHolder){
				VizHandler.getVizHolder().remove(groupHolder);
				groupHolder = null;
			}

			//EVENT HANDLERS
			events.off("update", update);
			events.off("onBeat", onBeat);

		}



	}

	function update() {

		posTime += vizParams.speed/200*(AudioHandler.getVolume() + 0.2);


		//mesh.material.color.setHex(Math.random() * 0xFFFFFF);



		particleHue = (simplexNoise.noise(posTime,0)+1)/2;
		material.color.setHSL(particleHue, 0.8, 0.5);

		//material.opacity = vizParams.opacity;
		// for (i = 0; i < beamCount; ++i) {
		// 	beamGroup.children[i].material.opacity = 0.15 * vizParams.opacity;
		// }

		//material.size = 40;//vizParams.size * 10 * (AudioHandler.getVolume() + 0.2);

		for (i = 0; i < starCount; i++) {
			var star = stars[i];
			var pos = ((star.initPos + posTime) % 1) * 2000 - 1000;
			star.position.z =	pos;

			//star.scale.y = BPMHandler.getBPMTime();
		}

	}

	function onBeat(){
		if (Math.random() < .5) return;
		//particles.rotation.x = Math.random()*Math.PI*2;
		//particles.rotation.y += Math.random()*Math.PI*2;
		groupHolder.rotation.z += Math.random()*Math.PI*2;
	}

	return {
		init:init,
		update:update
	};

}();
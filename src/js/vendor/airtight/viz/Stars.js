var Stars = function() {



	var vizParams = {
		on:false,
		size: 5,
		speed: 2,
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
		var folder = ControlsHandler.getVizFolder().addFolder('Stars');
		folder.add(vizParams, 'on').onChange(onToggleViz);
		folder.add(vizParams, 'size', 0, 10).name("Size");
		folder.add(vizParams, 'speed', 0, 10).name("Speed");
		folder.add(vizParams, 'opacity', 0, 1).name("Opacity");
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
			var sprite = THREE.ImageUtils.loadTexture("../res/img/particle.png");
			material = new THREE.ParticleBasicMaterial({
				size: 100,
				map: sprite,
				blending: THREE.AdditiveBlending,
				depthTest: false,
				transparent: true,
				opacity:1,
				//sizeAttenuation: false,
				//vertexColors: true //allows 1 color per particle
				//color: 0xFF0000
			});

			//create particles
			var spread =  1000;
			for (i = 0; i < starCount; i++) {

				var posn = new THREE.Vector3(ATUtil.randomRange(-spread,spread),
				ATUtil.randomRange(-spread,spread),
				ATUtil.randomRange(-spread,spread));

				geometry.vertices.push(posn);


				var star = {initPos: Math.random(),
							};

				stars.push(star);
			}

			//geometry.colors = colors;

			//init particle systemvizParams.opacity;
			particles = new THREE.ParticleSystem(geometry, material);
			particles.position.z = -500;
			particles.sortParticles = false;

			groupHolder.add(particles);



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

		posTime += vizParams.speed/500;



		//particleHue = (simplexNoise.noise(posTime,0)+1)/2;
		//material.color.setHSL(particleHue, 0.8, 0.5);

		material.opacity = vizParams.opacity;
		// for (i = 0; i < beamCount; ++i) {
		// 	beamGroup.children[i].material.opacity = 0.15 * vizParams.opacity;
		// }

		material.size = vizParams.size * 10 * (AudioHandler.getVolume() + 0.2);

		for (i = 0; i < starCount; i++) {
			var star = stars[i];
			var pos = ((star.initPos + posTime) % 1) * 2000 - 1000;
			geometry.vertices[i].z =	pos;
		}

		geometry.verticesNeedUpdate = true;

	}

	function onBeat(){
		if (Math.random() < .5) return;
		//particles.rotation.x = Math.random()*Math.PI*2;
		//particles.rotation.y += Math.random()*Math.PI*2;
		particles.rotation.z += Math.random()*Math.PI*2;
	}

	return {
		init:init,
		update:update
	};

}();
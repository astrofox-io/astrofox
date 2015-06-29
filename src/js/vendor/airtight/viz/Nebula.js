var Nebula = function() {



	var vizParams = {
		on:false,
		size: 3,
		speed: 2,
		opacity: 0.2,
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
		var folder = ControlsHandler.getVizFolder().addFolder('Nebula');
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

			groupHolder.position.z = -500;

			VizHandler.getVizHolder().add(groupHolder);

			//
			// THREE.NormalBlending = 0;
			// THREE.AdditiveBlending = 1;
			// THREE.SubtractiveBlending = 2;
			// THREE.MultiplyBlending = 3;
			// THREE.AdditiveAlphaBlending = 4;

			//PARTICLES
			//init Particles
			geometry = new THREE.Geometry();
			//create one shared material
			var sprite = THREE.ImageUtils.loadTexture("../res/img/particle.png");
			material = new THREE.ParticleBasicMaterial({
				size: 300,
				map: sprite,
				blending: THREE.AdditiveBlending,
				depthTest: false,
				transparent: true,
				opacity:.2,
				//sizeAttenuation: false,
				vertexColors: true //allows 1 color per particle
				//color: 0xFF0000
			});

			//create particles
			var spread =  300;
			for (i = 0; i < starCount; i++) {
				geometry.vertices.push(new THREE.Vector3(Math.random()*spread - spread/2,Math.random()*spread - spread/2,Math.random()*spread - spread/2));

				colors[i] = new THREE.Color();
				colors[i].setHSL(Math.random(), 0.8, 0.5);

				var star = {initPos: Math.random(),
							theta: Math.random()*Math.PI*2,
							phi: Math.random()*Math.PI*2,
							};



				stars.push(star);
			}

			geometry.colors = colors;

			//init particle systemvizParams.opacity;
			particles = new THREE.ParticleSystem(geometry, material);
			//particles.position.z = -500;
			particles.sortParticles = false;

			groupHolder.add(particles);


			 //init Sun Beams
			var i;
			var beamGeometry = new THREE.PlaneGeometry(5000, 50, 1, 1);
			beamGroup = new THREE.Object3D();

			for (i = 0; i < beamCount; ++i) {

				//create one material per beam
				var beamMaterial = new THREE.MeshBasicMaterial({
					opacity: 0.15,
					blending: THREE.AdditiveBlending,
					depthTest: false,
					transparent:true
				});
				beamMaterial.color = new THREE.Color();
				beamMaterial.color.setHSL(Math.random(), 1.0, 0.5);
				//create a beam
				beam = new THREE.Mesh(beamGeometry, beamMaterial);
				beam.doubleSided = true;
				beam.rotation.x = Math.random() * Math.PI;
				beam.rotation.y = Math.random() * Math.PI;
				beam.rotation.z = Math.random() * Math.PI;
				beamGroup.add(beam);
			}

			groupHolder.add(beamGroup);


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

		//rotate
		particles.rotation.x += PARTICLE_ROT_SPEED;
		particles.rotation.y += PARTICLE_ROT_SPEED;

		beamGroup.rotation.x += BEAM_ROT_SPEED;
		beamGroup.rotation.y += BEAM_ROT_SPEED;


		//particleHue = (simplexNoise.noise(posTime,0)+1)/2;
		//material.color.setHSL(particleHue, 0.8, 0.5);

		material.opacity = vizParams.opacity;
		for (i = 0; i < beamCount; ++i) {
			beamGroup.children[i].material.opacity = 0.15 * vizParams.opacity;
		}

		material.size = vizParams.size * 500 * (AudioHandler.getVolume() + 0.2);

		//use polar angles to loop star position based on vizParams.speed
		for (i = 0; i < starCount; i++) {
			var star = stars[i];
			var pos = ((star.initPos + posTime) % 1) * starRadius;
			geometry.vertices[i].x =	pos * Math.sin(star.theta)*Math.cos(star.phi);
			geometry.vertices[i].y =	pos * Math.sin(star.theta)*Math.sin(star.phi);
			geometry.vertices[i].z =	pos * Math.cos(star.theta);
		}

		geometry.verticesNeedUpdate = true;

	}

	function onBeat(){
		if (Math.random() < .5) return;
		particles.rotation.x = Math.random()*Math.PI*2;
		particles.rotation.y += Math.random()*Math.PI*2;
	}

	return {
		init:init,
		update:update
	};

}();
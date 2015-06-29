var Waveform = function() {

	//Viz Template

	var groupHolder;
	var material;
	var line;
	var lineGeom;
	var particleGeom;
	var color = [];

	var binCount = 512;
	var waveWidth = 1600;
	var waveHeight = 600;

	var vizParams = {
		on:false,
		sine:false,
		circle:false,
		waveHeight: 600
	};


	function init(){


		//INIT CONTROLS
		var folder = ControlsHandler.getVizFolder().addFolder('Waveform');
		folder.add(vizParams, 'on').onChange(onToggleViz);
		folder.add(vizParams, 'sine');
		folder.add(vizParams, 'circle');
		folder.add(vizParams, 'waveHeight', 10, 1000).step(100);
		//folder.open();
		onToggleViz();
	}


	function onToggleViz(){



		if (vizParams.on){

			groupHolder = new THREE.Object3D();
			VizHandler.getVizHolder().add(groupHolder);

			material = new THREE.LineBasicMaterial( {
					color: 0xffffff,
					linewidth: 6 ,
					opacity : 1,
					blending : THREE.AdditiveBlending,
					depthTest : false,
					transparent : true,
					vertexColors: true
				});

			//create geometry for points in a line
			lineGeom = new THREE.Geometry();

			lineGeom.colors = [];
			for(var i = 0; i < binCount; i++) {
				lineGeom.vertices.push(new THREE.Vector3(waveWidth/binCount * i - waveWidth/2,0,0));

				lineGeom.colors[i] = new THREE.Color();
				lineGeom.colors[i].setHSL( i/binCount, 0.8, 0.5);

			}

			line = new THREE.Line(lineGeom, material);


			line.scale.x = line.scale.y = line.scale.z  = 1.2;
			groupHolder.add(line);

			//PARTICLES
			//init Particles
			//GLow for main line
			particleGeom = lineGeom.clone();
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

			//init particle systemvizParams.opacity;
			var particles = new THREE.ParticleSystem(particleGeom, material);
			particles.sortParticles = false;
			groupHolder.add(particles);
			particles.scale.x = particles.scale.y = particles.scale.z  = 1.2;

			events.on("update", update);




		}else{

			if (groupHolder){
				VizHandler.getVizHolder().remove(groupHolder);
				groupHolder = null;
			}

			//EVENT HANDLERS
			events.off("update", update);

		}

	}

	function update() {

		//draw every frame

		for(var i = 0; i < binCount; i++) {


			//draw as circle
			if (vizParams.circle){
				var rad = 400;
				particleGeom.vertices[i].y = lineGeom.vertices[i].y = Math.sin(i/binCount*Math.PI*2) * (rad + AudioHandler.getWaveData()[i]*vizParams.waveHeight);
				particleGeom.vertices[i].x = lineGeom.vertices[i].x = Math.cos(i/binCount*Math.PI*2) * (rad + AudioHandler.getWaveData()[i]*vizParams.waveHeight);
			}else{
				particleGeom.vertices[i].x = lineGeom.vertices[i].x = waveWidth/binCount * i - waveWidth/2;
				particleGeom.vertices[i].y = lineGeom.vertices[i].y = AudioHandler.getWaveData()[i]*vizParams.waveHeight;
				//lineGeom.vertices[i].y += (waveData[i]*waveHeight - lineGeom.vertices[i].y)/5;
			}

			if (vizParams.sine){

				particleGeom.vertices[i].x = lineGeom.vertices[i].x = waveWidth/binCount * i - waveWidth/2;

				//sin mode
				//lineGeom.vertices[i].y = Math.sin((i/binCount - bpmTime)*Math.PI*2)*waveHeight/2;// + waveData[i]*waveHeight/6;
				//lineGeom.vertices[i].y = Math.sin(i/binCount*Math.PI - bpmTime*Math.PI*2)*waveHeight;// + waveData[i]*waveHeight/6;
				particleGeom.vertices[i].y = lineGeom.vertices[i].y += ((Math.sin(i/binCount*Math.PI - BPMHandler.getBPMTime()*Math.PI*2)*vizParams.waveHeight) - lineGeom.vertices[i].y )/5;// + waveData[i]*waveHeight/6;

			}

		}



		lineGeom.verticesNeedUpdate = true;

		particleGeom.verticesNeedUpdate = true;

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
		onBPMBeat:onBPMBeat,
	};

}();
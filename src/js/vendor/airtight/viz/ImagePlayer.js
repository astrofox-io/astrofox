//WEBGL IMAGE FLASHER

var ImagePlayer = function() {

	var groupHolder;

	var textures = [];
	var imgCount = 4;

	var imgId = 0;

	var strobe = true;
	var plane;
	var plane2;
	var imgMaterial;
	var imgMaterial2;


	var vizParams = {
		on:true,
		freakOut: false,

	};

	function init(){

		//INIT CONTROLS
		var folder = ControlsHandler.getVizFolder().addFolder('Image Overlay');
		folder.add(vizParams, 'on').onChange(onToggleViz);
		folder.add(vizParams, 'freakOut');
		//folder.open();
		onToggleViz();

	}

	function onToggleViz(){


		if (vizParams.on){

			groupHolder = new THREE.Object3D();
			VizHandler.getVizHolder().add(groupHolder);

			events.on("update", update);
			events.on("onBeat", onBeat);
			events.on("onBPMBeat", onBPMBeat);

			//move up?
			for (var i = 0; i <imgCount; i++) {
				textures[i] = THREE.ImageUtils.loadTexture( "../res/img/bbng/" + i + ".png" );
			};

			imgMaterial = new THREE.MeshBasicMaterial( {
				map : textures[0],
				transparent:true,
				//blending: THREE.AdditiveBlending
			} );

			//Add img plane
			var planeGeometry = new THREE.PlaneGeometry( 800, 600,1,1 );
			plane = new THREE.Mesh( planeGeometry, imgMaterial );
			groupHolder.add( plane );
			plane.z = 0;
			plane.scale.x = plane.scale.y = 3;

			/////////////////

			// imgMaterial2 = new THREE.MeshBasicMaterial( {
			// 	map : textures[0],
			// 	transparent:true,
			// 	//blending: THREE.AdditiveBlending
			// } );

			// //Add img plane
			// var planeGeometry = new THREE.PlaneGeometry( 800, 600,1,1 );
			// plane2 = new THREE.Mesh( planeGeometry, imgMaterial2 );
			// //groupHolder.add( plane2 );
			// plane2.z = 0;
			// plane2.scale.x = plane2.scale.y = 3;

		}else{

			if (groupHolder){
				VizHandler.getVizHolder().remove(groupHolder);
				groupHolder = null;
			}

			//EVENT HANDLERS
			events.off("update", update);
			events.off("onBeat", onBeat);
			events.off("onBPMBeat", onBPMBeat);

		}



	}

	function switchImage(){


		//imgId++;
		//imgId = imgId % imgCount;
		//imgMaterial.map = textures[imgId];


		//plane.rotation.z = Math.random()*Math.PI*2;
		//plane2.rotation.z = Math.random()*Math.PI*2 + Math.PI/2;

		if (Math.random() < .8){
			plane.visible = false;
		}else{
			plane.visible = true;
			imgMaterial.map = textures[ATUtil.randomInt(0,imgCount-1)];
			//imgMaterial2.map = textures[ATUtil.randomInt(0,imgCount-1)];
		}
		//plane.scale.x = plane.scale.y = 2 * Math.random();

	}

	function update() {

		//draw every frame
		//groupHolder.rotation.z += 0.01;
		
		//var gotoScale = AudioHandler.getSmoothedVolume() * 1.5 + .5;
		//groupHolder.scale.x = groupHolder.scale.y = groupHolder.scale.z = gotoScale;


		if (vizParams.freakOut){
			//switchImage();
			strobe = !strobe;
			imgMaterial.opacity = strobe ? 0 :1;
		}

	}

	function onBeat(){
		switchImage();
	}

	function onBPMBeat(){
		//bpm
		//switchImage();
	}

	function toggleBPMMode(tog){
	}

	return {
		init:init,
		update:update,
		onBeat:onBeat,
		onBPMBeat:onBPMBeat,
	};

}();
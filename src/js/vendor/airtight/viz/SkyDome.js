var SkyDome = function() {


	var groupHolder;


	var backMaterial;
	var backMaterial2;

	var vizParams = {
		on:false,
		opacity:.5,
		freakout:false
	};

	function init(){

		//INIT CONTROLS
		var folder = ControlsHandler.getVizFolder().addFolder('Sky Dome');
		folder.add(vizParams, 'on').onChange(onToggleViz);
		folder.add(vizParams, 'freakout');
		folder.add(vizParams, 'opacity', 0, 1).name("Opacity").onChange(onSetParams);
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

			//BKGND PLANE
			//imgTextureStars = THREE.ImageUtils.loadTexture( "../res/img/sky4.jpg" );

			imgTextureStars = THREE.ImageUtils.loadTexture( "../res/img/dots4.png" );
			imgTextureStars.wrapS = imgTextureStars.wrapT = THREE.RepeatWrapping;
			imgTextureStars.repeat.set( 10, 10 );


			backMaterial = new THREE.MeshBasicMaterial( {
				blending: THREE.AdditiveBlending,
				map:imgTextureStars,
				transparent:true,
				depthTest: false
			} );

			backMesh = new THREE.Mesh( new THREE.SphereGeometry( 2000, 30, 20 ), backMaterial  );
			backMesh.scale.x = -1;
			groupHolder.add( backMesh );

			imgTextureStripes2 = THREE.ImageUtils.loadTexture( "../res/img/stripes2.jpg" );
			imgTextureStripes2.wrapS = imgTextureStripes2.wrapT = THREE.RepeatWrapping;
			imgTextureStripes2.repeat.set( 10, 10 );
			backMaterial2 = new THREE.MeshBasicMaterial( {
				map:imgTextureStripes2,
				transparent:true,
				depthTest: false
			} );

			// backMesh2 = new THREE.Mesh( new THREE.SphereGeometry( 1900, 30, 20 ), backMaterial2  );
			// backMesh2.scale.x = -1;
			// //groupHolder.add( backMesh2 );
			// backMesh2.visible = false;


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

	function onSetParams(){
		backMaterial.opacity = vizParams.opacity;
		backMaterial2.opacity = vizParams.opacity;
	}

	function update() {

		//draw every frame

		backMesh.rotation.y += 0.003;
		//backMesh2.rotation.y += 0.003;


		var scl = 1 + AudioHandler.getVolume() * 0.2;
		backMesh.scale.set(-scl,scl,scl);


		//flash background  on level threshold
		// if (AudioHandler.getVolume() > 0.5 ){
		// 	backMesh.visible = true;
		// }else{
		// 	backMesh.visible = false;
		// }



		}

	function onBeat(){
		//beat detected

		//show stripes for 6 frames on beat


		backMesh.material = backMaterial2;

		//backMesh2.visible = true;
		setTimeout(onBeatEnd,150);

	}

	function onBeatEnd(){
		//backMesh2.visible = false;

		backMesh.material = backMaterial;

	}

	function onBPMBeat(){
		//bpm
	}

	return {
		init:init,
		update:update,
		onBeat:onBeat,
		onBPMBeat:onBPMBeat
	};

}();
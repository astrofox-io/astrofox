var VidPlayer = function() {

	//Viz Template

	var groupHolder;

	var video, videoTexture,videoMaterial;
	var video2, video2Texture,video2Material;

	function init(){

		groupHolder = new THREE.Object3D();
		VizHandler.getVizHolder().add(groupHolder);

		events.on("update", update);
		events.on("onBeat", onBeat);



		//Load Video
		video = document.createElement( 'video' );
		video.loop = true;
		video.autoplay = true;
		video.src = "../res/vid/6.mp4";
		video.play();

		//init video texture
		videoTexture = new THREE.Texture( video );
		videoTexture.minFilter = THREE.LinearFilter;
		videoTexture.magFilter = THREE.LinearFilter;

		videoMaterial = new THREE.MeshBasicMaterial( {
			map: videoTexture,
			blending : THREE.AdditiveBlending,
			depthTest : false,
			transparent: true,
			//wireframe:true
		} );

		//Add video plane
		var planeGeometry = new THREE.PlaneGeometry( 1080, 720,1,1 );
		var plane = new THREE.Mesh( planeGeometry, videoMaterial );
		groupHolder.add( plane );
		plane.z = 0;
		plane.scale.x = plane.scale.y = 2;

		/////////////////


		//2nd video layer - overlay
		video2 = document.createElement( 'video' );
		video2.loop = true;
		video2.autoplay = true;
		video2.src = "../res/vid/3.mp4";
		video2.play();

		//init video texture
		video2Texture = new THREE.Texture( video2 );
		video2Texture.minFilter = THREE.LinearFilter;
		video2Texture.magFilter = THREE.LinearFilter;

		video2Material = new THREE.MeshBasicMaterial( {
			map: video2Texture,
			transparent: true,
			blending : THREE.AdditiveBlending,
			depthTest : false,
			//wireframe:true

		} );

		//Add video plane
		var plane2 = new THREE.Mesh( planeGeometry, video2Material );
		groupHolder.add( plane2 );
		plane2.z = 10;
		plane2.scale.x = plane2.scale.y = 2;


	}

	function update() {

		//draw every frame


		//NEED THIS?
		if ( videoTexture ) videoTexture.needsUpdate = true;
		if ( video2Texture ) video2Texture.needsUpdate = true;


		//TODO - brightness w level

		videoMaterial.opacity = AudioHandler.getVolume()* 2;

		//console.log(AudioHandler.getVolume());

	}

	function onBeat(){
		//beat detected
		switchVid();

	}

	function onBPMBeat(){
		//bpm
	}

	function show(doShow){
		//groupHolder.traverse( function ( object ) { object.visible = doShow; } );
	}

	function toggleBPMMode(tog){
	}

	function switchVid(){

		console.log("switchvid");

		if (Math.random() < .5){
			var vids = ["6.mp4","7.mp4","8.mp4"];
			video.src = "../res/vid/" + vids[ATUtil.randomInt(0,vids.length-1)];
		}else{
			var overlayVids = ["1.mp4","2.mp4","3.mp4","4.mp4","5.mp4"];
			video2.src = "../res/vid/" + overlayVids[ATUtil.randomInt(0,overlayVids.length-1)];
		}
		
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
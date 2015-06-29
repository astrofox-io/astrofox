//UberViz VizHandler
//Handle 3D world
//Camera movement
//handle sub vizs

//RENDER AREA DIMS:
//SCREEN DIMS: 800 x 600
//CAM Z: 1000
//FAR CLIP Z: 3000
//TO FILL SCREEN AT Z 0: WIDTH 1840, HEIGHT: 1380


var VizHandler = function() {

	var rendertime = 0; //constantly incrementing value public
	var camera, scene, renderer;
	var debugCube;
	var renderToggle = true;
	var vizHolder;

	var FIXED_SIZE_W = 800;
	var FIXED_SIZE_H = 800;

	function init(){

		//SET ACTIVE VIZ HERE
		//VidPlayer,ImagePlayer,Bars,Crystal,Waveform
		//activeViz = [Waveform,Bars,Crystal,Nebula,ImagePlayer,WhiteRing];
		//activeViz = [Eclipse,Segments,Ripples,ImageTunnel,SkyDome,Waveform,Bars,Crystal,Nebula,ImagePlayer,Tunnel,BezierTrails,Stars,StarBars];
		activeViz = [Ripples,ImagePlayer];


		//EVENT HANDLERS
		events.on("update", update);

		//RENDERER
		renderer = new THREE.WebGLRenderer({
			antialias: false
		});
		renderer.setSize(800,600);
		renderer.setClearColor ( 0x000000);
		renderer.sortObjects = false;
		$('#webgl').append(renderer.domElement);

		//3D SCENE
		camera = new THREE.PerspectiveCamera( 70, FIXED_SIZE_W / FIXED_SIZE_H, 1, 4000 );
		camera.position.z = 1000;
		scene = new THREE.Scene();
		scene.add(camera);

		//fish eye
		//camera.fov = 120;
		//camera.updateProjectionMatrix();

		//scene.fog = new THREE.Fog( 0x000000, 2000, 3000 );

		//scene.fog = new THREE.Fog( 0xff0000, 600, 0 );
		//scene.fog = new THREE.Fog( 0x000000, 0, 600);



		//INIT VIZ
		vizHolder =  new THREE.Object3D();
		scene.add( vizHolder );
		vizHolder.sortObjects = false;


		// //*******************
		//DEBUG
		debugHolder =  new THREE.Object3D();
		vizHolder.add( debugHolder );
		//debugHolder.visible = false;

		// //Boundary cube
		// var geometry = new THREE.CubeGeometry( 1000, 1000, 1000 );
		// var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
		// // var mesh = new THREE.Mesh( geometry, material );
		// // debugHolder.add( mesh );

		// // //Debug Cube
		// geometry = new THREE.CubeGeometry( 100, 100, 100 );
		// debugCube = new THREE.Mesh( geometry, material );
		// debugHolder.add( debugCube );

		// //Debug Plane
		// //covers visible area
		// mesh = new THREE.Mesh( new THREE.PlaneGeometry( 800*2.3, 600*2.3,5,5 ), new THREE.MeshBasicMaterial( { color: 0x00FF00, wireframe: true } )  );
		// debugHolder.add( mesh);
		// //*******************


		//onResize();


		activeVizCount = activeViz.length;
		for ( var j = 0; j < activeVizCount; j ++ ) {
			activeViz[j].init();
		}

	}

	function update() {

		//render every other frame
		// renderToggle = !renderToggle;
		// if (!renderToggle) return;

		rendertime += 0.01;

		//DEBUG
		// if (level > 0 ) debugCube.scale.x = debugCube.scale.y = debugCube.scale.z = level*15;
		// debugCube.rotation.x += 0.01;
		// debugCube.rotation.y += 0.02;


		// renderer.render( scene, camera );


		//lerp around entire vizHolder
		//var rotRng = Math.PI/4 * FXHandler.fxParams.sceneTilt;
		//vizHolder.rotation.y = ATUtil.lerp(-rotRng,rotRng,(simplexNoise.noise(rendertime/5,0)+1)/2);
		//vizHolder.rotation.x = ATUtil.lerp(-rotRng,rotRng,(simplexNoise.noise(rendertime/5,100)+1)/2);



		//TODO - fix for segments
		//BIG TIME LERPING
		//vizHolder.rotation.x = simplexNoise.noise(rendertime * 0.06, 0) * Math.PI*2;
		//vizHolder.rotation.y = simplexNoise.noise(rendertime * 0.06,10) * Math.PI*2;


		//vizHolder.rotation.y = Math.PI/2;


		//UberVizMain.trace(vizHolder.rotation.y );

	}


	function onResize(){

		var renderW;
		var renderH;

		if (ControlsHandler.uiParams.fullSize){

			var renderW = window.innerWidth;
			var renderH = window.innerHeight;

			if (ControlsHandler.uiParams.showControls){
				renderW -= 262;//width of #controls-holder
			}

			$('#viz').css({top:0});
			$('#viz').css({left:0});

		}else{
			var renderW = FIXED_SIZE_W;
			var renderH = FIXED_SIZE_H;
			//vertically center viz output
			$('#viz').css({top:window.innerHeight/2 - FIXED_SIZE_H/2});

			//horiz center
			$('#viz').css({left:window.innerWidth/2 - FIXED_SIZE_W/2});
		}

		if(UberVizMain.hasWebGL()){

			camera.aspect = renderW / renderH;
			camera.updateProjectionMatrix();
			renderer.setSize( renderW,renderH);

		}

		
	}

	return {
		init: init,
		update: update,
		getVizHolder: function() { return vizHolder;},
		getCamera: function() { return camera;},
		getScene: function() { return scene;},
		getRenderer: function() { return renderer;},
		onResize: onResize,
		getRenderTime: function() { return rendertime;},
	};

}();
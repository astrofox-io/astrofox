//GRAPHIC EQUALIZER BARS VIZ

var Bars = function() {

	//Viz Template
	var groupHolder;
	var BAR_COUNT = 16;
	var vertDistance;
	var fillFactor= 0.8;
	var planeWidth = 2000;
	var segments = 30;

	var vizParams = {
		on:false,
		opacity:0.5
	};

	function init(){
		
		//CONTROLS
		var folder = ControlsHandler.getVizFolder().addFolder('Equalizer Bars');
		folder.add(vizParams, 'on').listen().onChange(onToggleViz);
		folder.add(vizParams, 'opacity', 0, 1).step(0.1).name("Opacity").onChange(onSetOpacity);
		onToggleViz();
	}

	function onToggleViz(){

		if (vizParams.on){

			//VIZ
			groupHolder = new THREE.Object3D();
			VizHandler.getVizHolder().add(groupHolder);
			groupHolder.position.z = 300;
			vertDistance = 1580 / BAR_COUNT;
			groupHolder.rotation.z = Math.PI/4;

			for ( var j = 0; j < BAR_COUNT; j ++ ) {

				var planeMat = new THREE.MeshBasicMaterial( {
					color: 0xEBFF33,
					transparent: true
					//side:THREE.DoubleSide //more complex shapes
				});
				planeMat.color.setHSL(j/BAR_COUNT, 1.0, 0.5);
				mesh = new THREE.Mesh( new THREE.PlaneGeometry( planeWidth, vertDistance,segments,segments), planeMat );
				mesh.position.y = vertDistance*j - (vertDistance*BAR_COUNT)/2;
				mesh.scale.y = (j+1)/BAR_COUNT*fillFactor;
				groupHolder.add( mesh );
			}

			//EVENT HANDLERS
			events.on("update", update);
			events.on("onBeat", onBeat);


		}else{

			if (groupHolder){
				VizHandler.getVizHolder().remove(groupHolder);
				groupHolder = null
			}

			//EVENT HANDLERS
			events.off("update", update);
			events.off("onBeat", onBeat);

		}



	}

	function onSetOpacity(){

		for ( var j = 0; j < BAR_COUNT; j ++ ) {
			var mesh = groupHolder.children[j];
			mesh.material.opacity = vizParams.opacity;
		}

	}

	function displaceMesh(){

		//rejigger z disps
		var MAX_DISP =  Math.random() * 100;
		var rnd = Math.random();
		for ( var j = 0; j < BAR_COUNT; j ++ ) {
			var mesh = groupHolder.children[j];
			//randomly warp mesh
			for(var i=0; i < mesh.geometry.vertices.length; i++) {
				vertex = mesh.geometry.vertices[i];
				var disp = simplexNoise.noise(vertex.x / planeWidth*100 ,rnd) * MAX_DISP;
				vertex.z = disp;
			}
			mesh.geometry.verticesNeedUpdate = true;
		}
	}


	function update() {

		//slowly move up
		groupHolder.position.y = BPMHandler.getBPMTime() * vertDistance;

		//scale bars on levels
		for ( var j = 0; j < BAR_COUNT; j ++ ) {
			groupHolder.children[j].scale.y = AudioHandler.getLevelsData()[j] * AudioHandler.getLevelsData()[j] + 0.00001;
		}
	}

	function onBeat(){

		groupHolder.rotation.z = Math.PI/4 * Math.floor(ATUtil.randomRange(0,4));

		//slight Y rotate
		groupHolder.rotation.y = ATUtil.randomRange(-Math.PI/4,Math.PI/4) ;


		displaceMesh();

	}

	return {
		init:init
	};

}();

//4 rotating tetrahedrons


var Crystal = function() {

	var groupHolder;
	var shapes = [];
	var shapesCount =  4;

	var vizParams = {
		on:false,
		scale:1,
		freakout:false
	};

	function init(){

		//INIT CONTROLS
		var folder = ControlsHandler.getVizFolder().addFolder('Sound Crystal');
		folder.add(vizParams, 'on').onChange(onToggleViz);
		folder.add(vizParams, 'freakout');
		folder.add(vizParams, 'scale', 0, 10).step(0.1).name("Size");
		//folder.open();
		onToggleViz();

	}

	function onToggleViz(){

		var size = 300;
		var geometry = new THREE.TetrahedronGeometry( size);

		if (vizParams.on){

			//VIZ
			groupHolder = new THREE.Object3D();
			VizHandler.getVizHolder().add(groupHolder);

			for (var i = 0; i <= shapesCount;i++){

				var material = new THREE.MeshBasicMaterial( {
					color: Math.random() * 0xFFFFFF,
					blending: THREE.AdditiveBlending,
					side:  THREE.DoubleSide,
					overdraw: true,
					opacity:ATUtil.randomRange(0.1,0.3),
					transparent:true
				} );

				//allow inner fulcrum
				//var innerGroup = new THREE.Object3D();

				var mesh = new THREE.Mesh( geometry, material  );
				mesh.scale.x = 2;
				groupHolder.add( mesh );

				//offsets
				var maxOffset = 100;
				mesh.restPosn = {};
				mesh.restPosn.x = ATUtil.randomRange(-maxOffset,maxOffset);
				mesh.restPosn.y = ATUtil.randomRange(-maxOffset,maxOffset);
				mesh.restPosn.z = ATUtil.randomRange(-maxOffset,maxOffset);

				//freakout posn
				var maxOffset = 600;
				mesh.maxPosn = {};
				mesh.maxPosn.x = ATUtil.randomRange(-maxOffset,maxOffset);
				mesh.maxPosn.y = ATUtil.randomRange(-maxOffset,maxOffset);
				mesh.maxPosn.z = ATUtil.randomRange(-maxOffset,maxOffset);

			}

			//EVENT HANDLERS
			events.on("update", update);
			events.on("onBeat", onBeat);
			events.on("onBPMBeat", onBPMBeat);


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

	function tweenShape() {

		//random shape
		var r = ATUtil.randomInt(0, shapesCount-1);
		var mesh = groupHolder.children[r];
		var time = BPMHandler.getBPMDuration()/1000*2;
		var easer = Expo.easeIn;

		TweenLite.to(mesh.rotation, time, {x: Math.random()*Math.PI*2, ease:easer});
		TweenLite.to(mesh.rotation, time, {y: Math.random()*Math.PI*2, ease:easer});
		TweenLite.to(mesh.rotation, time, {z: Math.random()*Math.PI*2, ease:easer});

		TweenLite.to(mesh.scale, time, {x: ATUtil.randomRange(0.5,3) , ease:easer});
		TweenLite.to(mesh.scale, time, {y: ATUtil.randomRange(0.5,3), ease:easer});
		TweenLite.to(mesh.scale,time, {z: ATUtil.randomRange(0.5,3), ease:easer});

		//flash opacity
		TweenLite.set(mesh.material,{opacity:1});
		TweenLite.to(mesh.material,time,{opacity:ATUtil.randomRange(0.1,0.3), ease:easer});

		//random color
		mesh.material.color.setHex(Math.random() * 0xFFFFFF);

	}

	function rotateCrystal(){
		groupHolder.rotation.x = Math.random()* Math.PI*2;
		groupHolder.rotation.z = Math.random()* Math.PI*2;
	}

	function update() {

		//rotate
		groupHolder.rotation.z += 0.01;
		groupHolder.rotation.x += 0.01;

		//volume bounce
		groupHolder.scale.x = groupHolder.scale.y = groupHolder.scale.z = 0.2 + (AudioHandler.getVolume()*0.6) * vizParams.scale;

		if (vizParams.freakout){
			//freakout - color flash
			var bulge = Math.sin((BPMHandler.getBPMTime())*Math.PI);
			for (var i = 0; i <= shapesCount;i++){
				var mesh = groupHolder.children[i];
				mesh.material.color.setHex(Math.random() * 0xFFFFFF);
				mesh.position.x = bulge* mesh.maxPosn.x;
				mesh.position.y = bulge* mesh.maxPosn.y;
				mesh.position.z = bulge* mesh.maxPosn.z;
			}
		}else{

			for (var i = 0; i <= shapesCount;i++){
				var mesh = groupHolder.children[i];
				mesh.position.x = mesh.restPosn.x;
				mesh.position.y = mesh.restPosn.y;
				mesh.position.z = mesh.restPosn.z;
			}
		}

	}

	function onBeat(){
		tweenShape();

	}

	function onBPMBeat(){
		rotateCrystal();
	}

	return {
		init:init,
		update:update,
		onBeat:onBeat,
		onBPMBeat:onBPMBeat,
	};

}();
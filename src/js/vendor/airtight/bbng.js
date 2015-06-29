//UberViz Main
//Handles HTML and wiring data
//Using Three v67
////

'use strict';

//GLOBAL
var events = new Events();
var simplexNoise = new SimplexNoise();


//MAIN RMP
var UberVizMain = function() {

	var stats;
	var windowHalfX;
	var windowHalfY;

	function init() {

		console.log("ÜberViz v0.9.0");

		if(!hasWebGL()){
			$("#play-btn").hide();
			$("#warning").show();
			$("#warning").html("Sorry!<br>This browser does not support WebGL. <br>Please use Chrome, Safari or Firefox.");
			window.addEventListener('resize', onResize, false);
			onResize();
			return;
		}

		//INIT DOCUMENT
		document.onselectstart = function() {
			return false;
		};

		document.addEventListener('mousemove', onDocumentMouseMove, false);
		document.addEventListener('mousedown', onDocumentMouseDown, false);
		document.addEventListener('mouseup', onDocumentMouseUp, false);
		document.addEventListener('drop', onDocumentDrop, false);
		document.addEventListener('dragover', onDocumentDragOver, false);
		window.addEventListener('resize', onResize, false);
		window.addEventListener('keydown', onKeyDown, false);
		window.addEventListener('keyup', onKeyUp, false);

		//STATS
		stats = new Stats();
		$('#controls').append(stats.domElement);
		stats.domElement.id = "stats";

		//INIT HANDLERS
		//SequenceHandler.init();
		AudioHandler.init();
		//BPMHandler.init(); //OPTIMIZE
		ControlsHandler.init();
		VizHandler.init();
		FXHandler.init();

		onResize();

		update();

		//init play button
		$("#play-btn").click(startMusic)

	}


	function startMusic(){
		$("#intro").hide();
		$("#info").show();
		//load MP3
		AudioHandler.loadSampleAudio();
	}

	function update() {
		requestAnimationFrame(update);
		stats.update();
		events.emit("update");
	}


	function onDocumentDragOver(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		return false;
	}

	//load dropped MP3
	function onDocumentDrop(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		AudioHandler.onMP3Drop(evt);
	}

	function onKeyDown(event) {
		switch ( event.keyCode ) {
			case 32: /* space */
				BPMHandler.onBPMTap();
				break;
			case 81: /* q */
				ControlsHandler.toggleControls();
				break;
			case 70: /* f */
				ControlsHandler.uiParams.fullSize = !ControlsHandler.uiParams.fullSize;
				VizHandler.onResize();
				break;
		}
	}

	function onKeyUp(event) {
	}

	function onDocumentMouseDown(event) {
	}

	function onDocumentMouseUp(event) {
	}

	function onDocumentMouseMove(event) {
		// mouseX = (event.clientX - windowHalfX) / (windowHalfX);
		// mouseY = (event.clientY - windowHalfY) / (windowHalfY);
	}

	function onResize() {
		//windowHalfX = window.innerWidth / 2;
		//windowHalfY = window.innerHeight / 2;
		VizHandler.onResize();
	}

	function trace(text){
		$("#debugText").text(text);
	}

	function hasWebGL() { 
		try { 
			return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); 
		} catch( e ) { 
			return false; 
		}
	}
	

	return {
		init:init,
		trace: trace,
		hasWebGL:hasWebGL
	};

}();

$(document).ready(function() {
	UberVizMain.init();
});
//UberViz ControlsHandler
//Handles side menu controls

//init controls for audio and ui folders


var ControlsHandler = function() {


	var gui;

	var vizFolder;

	var audioParams = {
		mute:false,
		useMic: false,
		autoLoadMP3: false,
		showDebug:true,
		volSens:1.3,
		beatHoldTime:30,
		beatDecayRate:0.97,
		beatThreshold: 0.15,
		bpmMode: false,
		bpmRate:0,
		smoothing:0.5,
		sampleURL: "../res/mp3/BBNG_Confessions_edit.mp3",
		//sampleURL: "../res/mp3/Cissy_Strut_Edit.mp3",
	};

	var uiParams = {
		fullSize: false,
		showControls: false,
	};

	// var fxParams = {
	// 	glow: 0.7
	// };

	function init(){

		//Init DAT GUI control panel
		gui = new dat.GUI({autoPlace: false });
		$('#settings').append(gui.domElement);

		var f2 = gui.addFolder('Audio');
		f2.add(audioParams, 'useMic').listen().onChange(AudioHandler.onUseMic).name("Use Mic");
		//f2.add(audioParams, 'mute').listen().onChange(AudioHandler.mute).name("Mute");
		//f2.add(audioParams, 'useSample').listen().onChange(AudioHandler.onUseSample);
		f2.add(audioParams, 'volSens', 0, 10).step(0.1).name("Gain");
		f2.add(audioParams, 'beatHoldTime', 0, 100).step(1).name("Beat Hold");
		f2.add(audioParams, 'beatThreshold', 0, 1).step(0.01).name("Beat Threshold");
		f2.add(audioParams, 'beatDecayRate', 0.9, 1).step(0.01).name("Beat Decay");
		f2.add(audioParams, 'smoothing', 0, 1).step(0.01).name("Smoothing").onChange(AudioHandler.setSmoothing);
		// f2.add(audioParams, 'bpmMode').listen();
		// f2.add(audioParams, 'bpmRate', 0, 4).step(1).listen().onChange(AudioHandler.onChangeBPMRate);
		//f2.open();

		//var f5 = gui.addFolder('Viz');
		//f5.add(fxParams, 'Full', 0, 4).listen().onChange(AudioHandler.onUseMic);
		// var f5 = gui.addFolder('FX');
		// f5.add(vizParams, 'fullSize').listen().onChange(VizHandler.onResize).name("Full Size");
		// f5.add(fxParams, 'glow', 0, 4).step(0.1);
		// f5.open();


		//var f3 = gui.addFolder('UI');
		//f3.add(uiParams, 'showControls').listen().onChange(toggleControls).name("Show Controls");

		vizFolder = gui.addFolder('Viz');
		vizFolder.open();

		vizFolder.add(uiParams, 'fullSize').listen().onChange(VizHandler.onResize).name("Full Size");

		//var f6 = gui.addFolder('Viz');
		//f5.open();


		// var f6 = gui.addFolder('Bloom');
		// for (var propertyName in bloomParams) {
		//	f6.add(bloomParams,propertyName)
		// }

		//TODO - better way to read in values at start
		// AudioHandler.onUseMic();
		// AudioHandler.onUseSample();
		// AudioHandler.onShowDebug();
		// AudioHandler.doAutoLoad();
		// AudioHandler.mute();

		$('#controls-holder').toggle(uiParams.showControls);


	}

	function toggleControls(){
		uiParams.showControls = !uiParams.showControls;
		$('#controls-holder').toggle();
		VizHandler.onResize();
	}

	return {
		init:init,
		audioParams: audioParams,
		uiParams:uiParams,
		toggleControls:toggleControls,
		getGui:function(){return gui;},
		vizFolder: vizFolder,
		getVizFolder:function(){return vizFolder;},
	};
}();
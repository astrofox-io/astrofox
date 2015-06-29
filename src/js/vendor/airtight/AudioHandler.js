//UberViz AudioHandler
//Handles Audio loading and Playback
//Handles Audio Analysis + publishes audio data

var AudioHandler = function() {

	//PUBLIC/////////////
	var waveData = []; //waveform - from 0 - 1 . no sound is 0.5. Array [binCount]
	var levelsData = []; //levels of each frequecy - from 0 - 1 . no sound is 0. Array [levelsCount]
	var volume = 0; // averaged normalized level from 0 - 1
	var intensity = 0; // long term volume of this part of track versus previous level from 0 - 1
	var smoothedVolume = 0; // averaged normalized level from 0 - 1 smoothed
	var levelHistory = []; //last 256 ave norm levels

	var BEAT_HOLD_TIME = 40; //num of frames to hold a beat
	var BEAT_DECAY_RATE = 0.98;
	var BEAT_MIN = 0.15; //level less than this is no beat

	var displayCtx;
	var chartW = 220;
	var aveBarWidth = 30;
	var displayH = 100;
	var displayW = chartW + aveBarWidth;
	var debugSpacing = 2;
	var gradient;

	var freqByteData; //bars - bar data is from 0 - 256 in 512 bins. no sound is 0;
	var timeByteData; //waveform - waveform data is from 0-256 for 512 bins. no sound is 128.
	var levelsCount = 16; //should be factor of 512

	var binCount; //512
	var levelBins;

	var isPlayingAudio = false;

	var beatCutOff = 0;
	var beatTime = 0;

	var source;
	var buffer;
	var audioBuffer;
	var dropArea;
	var audioContext;
	//var processor;
	var analyser;
	var gainNode;

	var high = 0;


	function init() {

		//EVENT HANDLERS
		events.on("update", update);
		
		//Get an Audio Context
		try {
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			audioContext = new window.AudioContext();
		} catch(e) {
			//Web Audio API is not supported in this browser
			$("#play-btn").hide();
			$("#warning").show();
			$("#warning").html("Sorry!<br>This browser does not support the Web Audio API. <br>Please use Chrome, Safari or Firefox.");
			return;
		}
		
		//processor = audioContext.createScriptProcessor(2048 , 1 , 1 );

		analyser = audioContext.createAnalyser();
		analyser.smoothingTimeConstant = 0.3; //smooths out bar chart movement over time
		analyser.fftSize = 1024;

		binCount = analyser.frequencyBinCount; // = 512

		// Create a gain node.
		gainNode = audioContext.createGain();

		// Connect the source to the gain node.
		analyser.connect(gainNode);

		// Connect the gain node to the destination.
		gainNode.connect(audioContext.destination);

		levelBins = Math.floor(binCount / levelsCount); //number of bins in each level

		freqByteData = new Uint8Array(binCount);
		timeByteData = new Uint8Array(binCount);

		var length = 256;
		for(var i = 0; i < length; i++) {
			levelHistory.push(0);
		}

		//INIT DEBUG DRAW
		var canvas = document.getElementById("audioDebug");
		displayCtx = canvas.getContext('2d');
		displayCtx.width = displayW;
		displayCtx.height = displayH;
		displayCtx.fillStyle = "rgb(40, 40, 40)";
		displayCtx.lineWidth=2;
		displayCtx.strokeStyle = "rgb(255, 255, 255)";
		$('#audiodisplayCtx').hide();

		gradient = displayCtx.createLinearGradient(0,0,0,displayH);
		gradient.addColorStop(1,'#330000');
		gradient.addColorStop(0.85,'#aa0000');
		gradient.addColorStop(0.5,'#aaaa00');
		gradient.addColorStop(0,'#aaaaaa');

	}

	function initSound(){
		source = audioContext.createBufferSource();
		source.connect(analyser);
	}

	function doAutoLoad(){

		if (!ControlsHandler.audioParams.useMic && ControlsHandler.audioParams.autoLoadMP3){
			
			//LOAD AUDIO ELEMENT IN PAGE OR EXTERNAL MP3
			loadSampleAudio();
			//loadAudioElement();
		}
	}

	//load audio element on page
	function loadAudioElement(){

		audioElement = document.getElementById( 'audioElem' );
		source = audioContext.createMediaElementSource( audioElement);
		source.connect(analyser);
		audioElement.play();
		audioElement.loop = true;
		isPlayingAudio = true;

		$("#preloader").hide();

	}

	//load sample MP3
	function loadSampleAudio() {

		stopSound();

		initSound();

		////////////////////

		// Load asynchronously
		var request = new XMLHttpRequest();
		request.open("GET", ControlsHandler.audioParams.sampleURL, true);
		request.responseType = "arraybuffer";

		request.onload = function() {


			audioContext.decodeAudioData(request.response, function(buffer) {
				audioBuffer = buffer;
				startSound();
			}, function(e) {
				console.log(e);
			});


		};
		request.send();

		////////////////////

		//using fast load method from here: http://www.clicktorelease.com/tmp/fastload/
		//doesnt work w/ Safari 7.0.4 + OSX 10.9.3. 
		// var a = document.createElement( 'audio' );
		// a.src = ControlsHandler.audioParams.sampleURL;
		// a.play();
		// source = audioContext.createMediaElementSource( a );
		// source.connect(analyser);
		// a.loop = true;
		// isPlayingAudio = true;
		// $("#preloader").hide();

	}

	function startSound() {
		console.log("start");

		source.buffer = audioBuffer;
		source.loop = true;
		source.start(0.0);
		isPlayingAudio = true;
		//startViz();

		$("#preloader").hide();
	}


	function mute(){

		if (ControlsHandler.audioParams.mute){
			gainNode.gain.value = 0;
		}else{
			gainNode.gain.value = 1;
		}


	}

	function stopSound(){

		if (isPlayingAudio){
			isPlayingAudio = false;
			if (source) {
				source.stop(0);
				source.disconnect();
			}
			displayCtx.clearRect(0, 0, displayW, displayH);
		}
		
	}

	function onUseMic(){

		if (ControlsHandler.audioParams.useMic){
			ControlsHandler.audioParams.useSample = false;
			getMicInput();
		}else{
			stopSound();
		}
	}

	function onUseSample(){
		if (ControlsHandler.audioParams.useSample){
			loadSampleAudio();
			ControlsHandler.audioParams.useMic = false;
		}else{
			stopSound();
		}
	}

	function onShowDebug(){
		if (ControlsHandler.audioParams.showDebug){
			$('#audioDebug').show();
		}else{
			$('#audioDebug').hide();
		}

	}

	//load dropped MP3
	function onMP3Drop(evt) {

		//TODO - uncheck mic and sample in CP

		ControlsHandler.audioParams.useSample = false;
		ControlsHandler.audioParams.useMic = false;

		stopSound();

		initSound();

		var droppedFiles = evt.dataTransfer.files;
		var reader = new FileReader();
		reader.onload = function(fileEvent) {
			var data = fileEvent.target.result;
			onDroppedMP3Loaded(data);
		};
		reader.readAsArrayBuffer(droppedFiles[0]);
	}

	//called from dropped MP3
	function onDroppedMP3Loaded(data) {

		audioContext.decodeAudioData(data, function(buffer) {
			audioBuffer = buffer;
			startSound();
		}, function(e) {
			console.log(e);
		});

	}

	function getMicInput() {

		stopSound();

		//x-browser
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

		if (navigator.getUserMedia ) {

			navigator.getUserMedia(


				//constraints
				{audio: true},

 				// successCallback
				function(stream) {

					//reinit here or get an echo on the mic
					source = audioContext.createBufferSource();
					analyser = audioContext.createAnalyser();
					analyser.fftSize = 1024;
					analyser.smoothingTimeConstant = 0.3;

					microphone = audioContext.createMediaStreamSource(stream);
					microphone.connect(analyser);
					isPlayingAudio = true;
					// console.log("here");
				},

				// errorCallback
				function(err) {
					alert("The following error occured: " + err);
				}
			);
		}else{
			alert("Could not getUserMedia");
		}
	}

	function onBeat(){
		if (ControlsHandler.audioParams.bpmMode) return;
		events.emit("onBeat");
	}

	//called every frame
	//update published viz data
	function update(){

		//console.log("audio.update");

		if (!isPlayingAudio) return;

		//GET DATA
		analyser.getByteFrequencyData(freqByteData); //<-- bar chart
		analyser.getByteTimeDomainData(timeByteData); // <-- waveform

		//normalize waveform data
		for(var i = 0; i < binCount; i++) {
			waveData[i] = ((timeByteData[i] - 128) /128 )* ControlsHandler.audioParams.volSens;
		}
		//TODO - cap levels at 1 and -1 ?

		//normalize levelsData from freqByteData
		for(var i = 0; i < levelsCount; i++) {
			var sum = 0;
			for(var j = 0; j < levelBins; j++) {
				sum += freqByteData[(i * levelBins) + j];
			}
			levelsData[i] = sum / levelBins/256 * ControlsHandler.audioParams.volSens; //freqData maxs at 256



			//adjust for the fact that lower levels are percieved more quietly
			//make lower levels smaller
			//levelsData[i] *=  1 + (i/levelsCount)/2; //??????
		}
		//TODO - cap levels at 1?

		//GET AVG LEVEL
		var sum = 0;
		for(var j = 0; j < levelsCount; j++) {
			sum += levelsData[j];
		}

		volume = sum / levelsCount;

		smoothedVolume += (volume - smoothedVolume)/5;

		// high = Math.max(high,level);
		levelHistory.push(volume);
		levelHistory.shift(1);

		//BEAT DETECTION
		if (volume  > beatCutOff && volume > ControlsHandler.audioParams.beatThreshold){
			onBeat();
			beatCutOff = volume *1.1;
			beatTime = 0;
		}else{
			if (beatTime <= ControlsHandler.audioParams.beatHoldTime){
				beatTime ++;
			}else{
				beatCutOff *= ControlsHandler.audioParams.beatDecayRate;
				beatCutOff = Math.max(beatCutOff,ControlsHandler.audioParams.beatThreshold);
			}
		}

		if (ControlsHandler.audioParams.showDebug) debugDraw();

	}



	function debugDraw(){

		displayCtx.clearRect(0, 0, displayW, displayH);
		//draw chart bkgnd
		//displayCtx.fillStyle = "#000";
		//displayCtx.fillRect(0,0,displayW,displayH);

		//DRAW BAR CHART
		// Break the samples up into bars
		var barWidth = chartW / levelsCount;
		displayCtx.fillStyle=gradient;
		for(var i = 0; i < levelsCount; i++) {
			displayCtx.fillRect(i * barWidth, displayH, barWidth - debugSpacing, -levelsData[i]*displayH);
		}

		//DRAW VOLUME BAR + BEAT COLOR
		if (beatTime < 1){
			displayCtx.fillStyle="#FFF";
		}
		displayCtx.fillRect(chartW, displayH, aveBarWidth, -volume*displayH);

		//DRAW CUT OFF LINE
		displayCtx.beginPath();
		displayCtx.moveTo(chartW , displayH - beatCutOff*displayH);
		displayCtx.lineTo(chartW + aveBarWidth, displayH - beatCutOff*displayH);
		displayCtx.stroke();

		//DRAW SMOOTHED VOL LINE
		displayCtx.beginPath();
		
		displayCtx.strokeStyle = "rgb(0, 255, 0)";

		displayCtx.lineStyle="#0F0";
		displayCtx.moveTo(chartW , displayH-smoothedVolume*displayH);
		displayCtx.lineTo(chartW + aveBarWidth, displayH-smoothedVolume*displayH);
		displayCtx.stroke();


		displayCtx.strokeStyle = "rgb(255, 255, 255)";

		//DRAW WAVEFORM LINE
		displayCtx.beginPath();
		for(var i = 0; i < binCount; i++) {
			displayCtx.lineTo(i/binCount*chartW, waveData[i]*displayH/2 + displayH/2);
		}
		displayCtx.stroke();
	}

	function setSmoothing(e){
		analyser.smoothingTimeConstant = e;

	}

	return {
		onMP3Drop: onMP3Drop,
		loadSampleAudio: loadSampleAudio,
		onShowDebug:onShowDebug,
		onUseMic:onUseMic,
		onUseSample:onUseSample,
		doAutoLoad:doAutoLoad,
		update:update,
		init:init,
		getLevelsData: function() { return levelsData;},
		getWaveData: function() { return waveData;},
		getVolume: function() { return volume;},
		getIntensity: function() { return intensity;},
		getSmoothedVolume: function() { return smoothedVolume;},
		setSmoothing:setSmoothing,
		mute:mute,
		getAudioTime: function() { return audioElement.currentTime;},
	};

}();
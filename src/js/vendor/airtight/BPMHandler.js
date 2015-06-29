//UberViz BMPHandler
//Handles Tap BPM

var BPMHandler = function() {

	//PUBLIC/////////////
	var bpmTime = 0; // bpmTime ranges from 0 to 1. 0 = on beat. Based on tap bpm
	var bpmDuration = 500; //time between beats (msec) //assume 120BPM - 60 x 1000 /120
	
	//var ratedBPMTime = 550;//time between beats (msec) multiplied by BPMRate
	var bpmStart;
	var count = 0;
	var msecsFirst = 0;
	var msecsPrevious = 0;
	var timer;

	var displaySize = 30;

	var displayCtx;

	function init() {
		//EVENT HANDLERS
		events.on("update", update);
		timer = setInterval(onBMPBeat,bpmDuration);

		//INIT DEBUG DRAW
		var canvas = document.getElementById("bpmDisplay");
		displayCtx = canvas.getContext('2d');
	}
	
	function onBMPBeat(){
		events.emit("onBPMBeat");
		bpmStart = new Date().getTime();
	}

	function update(){
		bpmTime = (new Date().getTime() - bpmStart)/bpmDuration;
		debugDraw();
	}

	function debugDraw(){

		//DRAW BPM
		var size = displaySize - bpmTime*displaySize;
		displayCtx.fillStyle="#030";
		displayCtx.fillRect(0,0, displaySize, displaySize);
		displayCtx.fillStyle="#0D0";
		displayCtx.fillRect((displaySize - size)/2,(displaySize - size)/2, size, size);

	}

	function onBPMTap() {

		clearInterval(timer);
		timeSeconds = new Date();
		msecs = timeSeconds.getTime();

		//after 2 seconds, new tap counts as a new sequnce
		if ((msecs - msecsPrevious) > 2000){
			count = 0;
		}

		if (count === 0){
			msecsFirst = msecs;
			count = 1;
		}else{
			bpmAvg = 60000 * count / (msecs - msecsFirst);
			bpmDuration = (msecs - msecsFirst)/count;
			count++;
			$("#bpmText").text("BPM: " + Math.round(bpmAvg * 100) / 100);
			onBMPBeat();
			clearInterval(timer);
			timer = setInterval(onBMPBeat,bpmDuration);
		}
		msecsPrevious = msecs;
	}

	// function onChangeBPMRate(){
	// 	//change rate without losing current beat time
	// 	//get ratedBPMTime from real bpm
	// 	switch(ControlsHandler.audioParams.bpmRate)
	// 	{
	// 	case -3:
	// 		ratedBPMTime = bpmDuration *8;
	// 		break;
	// 	case -2:
	// 		ratedBPMTime = bpmDuration *4;
	// 		break;
	// 	case -1:
	// 		ratedBPMTime = bpmDuration *2;
	// 		break;
	// 	case 0:
	// 		ratedBPMTime = bpmDuration;
	// 		break;
	// 	case 1:
	// 		ratedBPMTime = bpmDuration /2;
	// 		break;
	// 	case 2:
	// 		ratedBPMTime = bpmDuration /4;
	// 		break;
	// 	case 3:
	// 		ratedBPMTime = bpmDuration /8;
	// 		break;
	// 	case 4:
	// 		ratedBPMTime = bpmDuration /16;
	// 		break;
	// 	}

	// 	//console.log("ratedBPMTime: " + ratedBPMTime);


	// 	//get distance to next beat
	// 	bpmTime = (new Date().getTime() - bpmStart)/bpmDuration;
	// 	timeToNextBeat = ratedBPMTime - (new Date().getTime() - bpmStart);
	// 	//set one-off timer for that
	// 	clearInterval(timer);
	// 	timer = setInterval(onFirstBPM,timeToNextBeat);
	// 	//set timer for new beat rate
	// }


	function onFirstBPM(){
		clearInterval(timer);
		timer = setInterval(onBMPBeat,ratedBPMTime);
	}

	return {
		
		update:update,
		init:init,
		onBPMTap:onBPMTap,
		//onChangeBPMRate:onChangeBPMRate,		
		getBPMTime: function() { return bpmTime;},
		getBPMDuration: function() { return bpmDuration;}		

	};

}();
//UberViz SequenceHandler
//Super simple sequencer
//inspired by https://github.com/mrdoob/frame.js


//fires events when the mp3 time hits a mark

//TODO
//read external song data json file
//handle events with a length + parameters
//sort events
//handle scrubber clicks



var sequence; //array of events

var SequenceHandler = function() {


	//FIXME
	var sequenceData = wakeUpsData;
	var duration;

	
	var lastTime;
	var nextElementId;

	function init(){

		//INIT EVENT HANDLERS
		events.on("update", update);

		duration = sequenceData.duration;

		sequence = [];

		//read sequence data
		var len = sequenceData.sequence.length;
		for ( var i = 0; i < len; i ++ ) {
			var data = sequenceData.sequence[ i ];
			var start = data[ 0 ];
			var end = data[ 1 ];
			var name = data[ 2 ];
			var element = new SequenceElement( start,end,name);
			sequence.push( element );
		}

		nextElementId = 0;
		
	}

	function update() {

		//console.log("update");

		var currentTime = AudioHandler.getAudioTime();

		if ( currentTime < lastTime){
			console.log("reset");
			reset();
			return;
		}

		//check for next event
		if (sequence[ nextElementId ]){
			var element = sequence[ nextElementId ];
			if ( element.start < currentTime ) {
				//fire event
				//console.log("fire: " , element.name , element.start , currentTime);
				events.emit(element.name);
				nextElementId++;
			}
		}

		lastTime = currentTime;

	}

	function reset(){

		nextElementId = 0;
		lastTime = 0;
		events.emit("looped");

	}

	return {
		init: init,
		update: update,
		getSequence: function() { return sequence;},
		getDuration: function() { return duration;},
	};

}();

var SequenceElement = function ( start,end,name ) {

	this.name = name; //name is an event name
	this.start = start;
	this.end = end;
	this.duration = end - start;
	//this.module = module;

};
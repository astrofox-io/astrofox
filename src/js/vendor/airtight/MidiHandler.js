
var midiMap = {
	useMic: false,
	useSample: true,
	showDebug:true,
	volSens:1,
	beatHoldTime:20,
	beatDecayRate:0.97,
	bpmMode: false,
	bpmRate:0
};




var Jazz;
var active_element;
var current_in;
var msg;
var sel;

//// Callback function
function midiProc(t,a,b,c){

	//b is control ID
	//C is value: 0 -> 127

	console.log(midiString(a,b,c));

	//TODO make nicer with map and such

	switch(b){
	//buttons
	case 12:
		ControlsHandler.shapesParams.showNeon = (c === 127);
		VizHandler.toggleNeon(); //FIXME - should be auto triggered?
		break;
	case 13:
		ControlsHandler.shapesParams.showGold = (c === 127);
		VizHandler.toggleGold(); //FIXME - should be auto triggered?
		break;
	case 92:
		ControlsHandler.audioParams.bpmMode = (c === 127);
		break;
	case 22:
		ControlsHandler.waveParams.sineMode = (c !== 127);
		break;
	

	//sliders
	case 94:

		var newVal = Math.floor(c /127 * 4);
		//only trigger if changed
		if (newVal != ControlsHandler.audioParams.bpmRate){
			ControlsHandler.audioParams.bpmRate = newVal;
			AudioHandler.onChangeBPMRate();
		}
		break;

	case 84:

		var newVal = c /127;
		//only trigger if changed
		if (newVal != ControlsHandler.fxParams.waveDistort){
			ControlsHandler.fxParams.waveDistort = newVal;
		}
		break;
	}



}

function h2d(h) {return parseInt(h,16);}

function midiString(a,b,c){


	var str=b + " : " + c;
	return str;
}

//// Listbox
function changeMidi(){
	try{
		if(sel.selectedIndex){
			current_in=Jazz.MidiInOpen(sel.options[sel.selectedIndex].value,midiProc);
		} else {
			Jazz.MidiInClose(); current_in='';
		}
		for(var i=0;i<sel.length;i++){
			if(sel[i].value==current_in) sel[i].selected=1;
		}
	}
	catch(err){}
}

//// Connect/disconnect
function connectMidiIn(){
	try{
		var str=Jazz.MidiInOpen(current_in,midiProc);
		for(var i=0;i<sel.length;i++){
			if(sel[i].value==str) sel[i].selected=1;
		}
	}
	catch(err){}
}
function disconnectMidiIn(){
	try{
		Jazz.MidiInClose(); sel[0].selected=1;
	}
	catch(err){}
}
function onFocusIE(){
	active_element=document.activeElement;
	connectMidiIn();
}
function onBlurIE(){
	if(active_element!=document.activeElement){ active_element=document.activeElement; return;}
	disconnectMidiIn();
}

//// Initialize
Jazz=document.getElementById("Jazz1"); if(!Jazz || !Jazz.isJazz) Jazz = document.getElementById("Jazz2");
msg=document.getElementById("msg");
sel=document.getElementById("midiIn");
try{
	current_in=Jazz.MidiInOpen(0,midiProc);
	var list=Jazz.MidiInList();
	for(var i in list){
		sel[sel.options.length]=new Option(list[i],list[i],list[i]==current_in,list[i]==current_in);
	}
}
catch(err){}

if(navigator.appName=='Microsoft Internet Explorer'){ document.onfocusin=onFocusIE; document.onfocusout=onBlurIE;}
else{ window.onfocus=connectMidiIn; window.onblur=disconnectMidiIn;}
--></script>
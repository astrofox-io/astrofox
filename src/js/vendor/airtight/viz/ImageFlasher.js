//IMAGE FLASHER

//HTML IMAGE FLASHER

var ImageFlasher = function() {

	//Viz Template
	var MAX_IMAGE_COUNT = 500;
	var imgPath = "../res/img/flasher/";
	var imgNames = ["bwl.png","cross.png"];

	var $imgHolder;
	var imgs = [];
	var imgCount = imgNames.length;
	var currentImgId = 0;

	function init(){

		//EVENT HANDLERS
		events.on("update", update);
		events.on("onBeat", onBeat);
		events.on("onBMPBeat", onBPMBeat);

		//add image holder on viz div
		$imgHolder = $("<div class='imgFlasher'>hello world</div>");
		$("#viz").append($imgHolder);

		//TODO preload image in folder
		for(var i = 0; i < imgCount; i++){
			var img = new Image();
			img.src = imgPath + imgNames[i];
			$imgHolder.append(img);
			imgs.push(img);
		}

	}

	function update() {

		toggleImage();

		



		
	}

	function showNextImage(){



		// imgs[currentImgId].style.visibility = 'visible';

		currentImgId ++;
		if (currentImgId == imgCount) currentImgId = 0;

		// imgs[currentImgId].style.visibility = 'hidden';



		//$imgHolder.css("background-url", );


		$imgHolder.css('background-image', 'url(' + imgPath + imgNames[currentImgId] + ')');

		// background: url(mypic.jpg) no-repeat center center;


	}

	function toggleImage(){

		//imgs[currentImgId].toggle();

		$imgHolder.toggle();

	}


	function onBeat(){

		showNextImage();

	}

	function onBPMBeat(){
		showNextImage();
	}

	return {
		init:init
	};

}();
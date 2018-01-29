
window.onload = function(){
	var canvas = document.getElementById('theCanvas');
	var ctx = canvas.getContext('2d');
	var messages = ["Hello.", "Let's experiment.", "Try using the sliders below.", "Click me to continue."];
	var messageIndex = 0;
	var startTextTime = 0;
	var textLoadTime = 1400;
	ctx.font = "30px Times New Roman";
	ctx.fillStyle = "rgba(255,255,255,0)";
	ctx.textAlign = "center";

	function dispText(timestamp){
		var timeDiff = (timestamp-startTextTime);
		var transparency = ((timestamp-startTextTime)%textLoadTime)/textLoadTime;
		if(timeDiff > textLoadTime*2){	// completed fade out
			startTextTime = timestamp;	// reset start time
			messageIndex++;				// next message
			dispText(timestamp);		// start over for new message
			return;						// don't continue
		}else if(timeDiff > textLoadTime){	// in fade out phase
			if( messageIndex == messages.length-1){	// don't fade out for last message
				document.getElementById('theCanvas').addEventListener("click", start); // trigger fnc start()
				document.getElementById('theCanvas').style.cursor='pointer';	// look nice with pointer cursor
				return;
			} 
			transparency = 1- transparency; // opposite of fade in transparency 0->1->0
		}
		ctx.clearRect(0,0,canvas.width,canvas.height);	// clear canvas
		ctx.fillStyle = "rgba(255,255,255," +transparency+ ")";	// fill style with proper transparency
		ctx.fillText(messages[messageIndex], canvas.width/2, canvas.height/2);	// center text
		requestAnimationFrame(function(timestamp){	// go to next frame
			dispText(timestamp);
		});
		return;
	}

	// first frame in displaying message
	requestAnimationFrame(function(timestamp){
		startTextTime = timestamp;
		dispText(timestamp);
	});
	
};

function start(){

	var numSlider = document.getElementById('numItems');
	var speedSlider = document.getElementById('speed');
	var widthSlider = document.getElementById('lineWidth');

	var canvas = document.getElementById('theCanvas');
	var size = {y: canvas.height, x: canvas.width};
	var ctx = canvas.getContext('2d');
	var items = [];
	var maxItems = numSlider.value;
	var startTime = 0;
	var loadTime = speedSlider.max - speedSlider.value;	//ms

	var color = "255,255,255";	// black?
	setColor(1.0);
	canvas.style.cursor='default';

	function getRandomInt(min,max) {
  		return Math.floor(Math.random() * Math.floor(max-min)) + Math.floor(min);
	}

	function setColor(transparency){
		ctx.strokeStyle = "rgba(" + color + ", " + transparency + ")";
		return "rgba(" + color + ", " + transparency + ")";
	}
	function setWidth(width){
		ctx.lineWidth = width;
		return;
	}

	function addItem(){
		var newCircle = {
				x: getRandomInt(0,size.x),
				y: getRandomInt(0,size.y),
				r: getRandomInt(0.05*Math.min(size.x, size.y),0.4*Math.max(size.x, size.y))
		};
		items.push(newCircle);
		return;
	}

	function removeItem(){
		items.shift();
		return;
	}

	function draw(i){
		var circle = items[i];
		if( circle ){
			ctx.beginPath();
			ctx.arc(circle.x, circle.y, circle.r, 0, 2*Math.PI);
			ctx.stroke();
		}
	}

	function drawAll(timestamp, currLoadTime) {
		// clear canvas
		ctx.clearRect(0,0,canvas.width,canvas.height);

		// determine transparency
		var transparency = (timestamp-startTime)/currLoadTime;
		if( transparency >= 1 ){
			currLoadTime = loadTime;
			startTime=timestamp;	//reset startTime if fully shown last item
			transparency = 0;		//back to completely transparent
			if( items.length >= maxItems ){ removeItem(); }		// remove oldest item only if items is full
			if( items.length < maxItems )addItem();				// add a new one if not enough
		}


		if( items.length >= maxItems ){ // if have enough, fade out oldest
			setColor(1-transparency); 
		}else{							// else show oldest
			setColor(1.0);
		}
		draw(0);					// draw oldest item



		setColor(1.0);				// set color for all items exc. first and last one
		for( var i=1; i<items.length-1; i++){
			draw(i);				// draw old items
		}


		if( items.length <= maxItems ){ // if not too many, fade in newest
			setColor(transparency); 
		}else{
			setColor(1.0);				// else show maintain newest
		}
		draw(items.length-1);		// draw animated item

		requestAnimationFrame(function(timestamp){
			drawAll(timestamp, currLoadTime);
		});
	}

	requestAnimationFrame(function(timestamp){
		startTime = timestamp;
		addItem();
		drawAll(timestamp, loadTime);
	});
	
	numSlider.oninput = function() {
		maxItems = this.value;
	};
	speedSlider.oninput = function() {
		loadTime = this.max-this.value;
	};
	widthSlider.oninput = function() {
		setWidth(this.value/1000.0);
	};

}
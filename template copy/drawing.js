
window.onload = function(){

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

	var color = "0,0,0";
	setColor(1.0);
	

	function getRandomInt(min,max) {
  		return Math.floor(Math.random() * Math.floor(max-min)) + Math.floor(min);
	};

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
		}
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
	}
	speedSlider.oninput = function() {
		loadTime = this.max-this.value;
	}
	widthSlider.oninput = function() {
		setWidth(this.value/1000.0);
	}

};
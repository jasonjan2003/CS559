
window.onload = function(){
	var canvas = document.getElementById('theCanvas');
	var ctx = canvas.getContext('2d');
	var messages = ["Hello.", "This is a simulation of planar motion.", "Try using the sliders below.", "Click me to continue."];
	//var messages = [''];
	var messageIndex = 0;
	var startTextTime = 0;
	var textLoadTime = 1400;
	ctx.font = "24px Times New Roman";
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

	var gravityXlider = document.getElementById('gravity_x');
	var gravityYlider = document.getElementById('gravity_y');
	var restitutionSlider = document.getElementById('restitution');

	var wrapper = document.getElementsByClassName('wrapper')[0];
	var canvas = document.getElementById('theCanvas');
	var size = {y: canvas.height, x: canvas.width};
	var ctx = canvas.getContext('2d');

	var startTime = 0;
	var ball = {x: 0, y: 0, r: 1};
		const ball_init = {x: 45, y: 45, r: 40};
	var velocity = {x:0, y:0};
		const velocity_init = {x:40, y:0};
		var max_speed = 0;
	var acc = {x: 0, y: 9.8*15};
	var coefrest = 0.9;
	const DIRECTION_CONSTANT = {X:0, Y:1};
	var path_history = [];
	var is_at_edge = {x:0, y:0};

	var color = "255,255,255";
	setColor("255,255,255");

	function getRandomInt(min,max) {
  		return Math.floor(Math.random() * Math.floor(max-min)) + Math.floor(min);
	}

	function setColor(color){
		ctx.strokeStyle = "rgb(" + color + ")";
		return ctx.strokeStyle;
	}

	function setWidth(width){
		ctx.lineWidth = width;
		return;
	}

	function initBall(){
		ball = ball_init;
		velocity = velocity_init;
		return;
	}

	function updatePhysics(dt){

		//newVelocity
		velocity = {
			x: acc.x * dt  + velocity.x,
			y: acc.y * dt  + velocity.y
		}


		var old_position = [ball.x, ball.y];
		if( is_at_edge.x > 0 && acc.x > 0){
			ball.x = 0 + velocity.x * dt + ball.x;
		}else{
			ball.x = 0.5 * acc.x * Math.pow(dt,2) + velocity.x * dt + ball.x;
		}
		if( is_at_edge.y> 0 && acc.y > 0){
			ball.y = 0 + velocity.y * dt + ball.y;
		}else{
			ball.y = 0.5 * acc.y * Math.pow(dt,2) + velocity.y * dt + ball.y;
		}
		ball.x = Math.min(size.x-ball.r, Math.max(ball.x, ball.r));	// ensure within stage
		ball.y = Math.min(size.y-ball.r, Math.max(ball.y, ball.r));	// ensure within stage
		var new_position = [ball.x, ball.y];
		path_history.push([old_position, new_position]);
		if( path_history.length > 500 )
			path_history.shift();


	}

	function collisionPhysics(DIR){
		if( DIR == DIRECTION_CONSTANT.X){
			velocity.x = -velocity.x * coefrest;
		}
		else if( DIR == DIRECTION_CONSTANT.Y){
			velocity.y = -velocity.y * coefrest;
		}
		return;
	}

	function drawHistoryPath(){
		
		ctx.save();
		ctx.beginPath();
		setColor("112,112,112");
		for (var i = 0; i < path_history.length; i++) {
			var path_segnment = path_history[i];
			ctx.moveTo(path_segnment[0][0], path_segnment[0][1]);
			ctx.lineTo(path_segnment[1][0], path_segnment[1][1]);
			ctx.stroke();
		};
		ctx.closePath();
		ctx.restore();
		
	};

	function drawBall(){
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.r, 0, 2*Math.PI);
		ctx.stroke();
		ctx.save();
		drawVectors();
		ctx.restore();
		ctx.closePath();
	}

	function drawVectors(){
		ctx.translate(ball.x, ball.y);	// translate to ball center;
		
		setColor("244, 66, 66");
		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(velocity.x, 0);
		if( velocity.x > 10){
			ctx.fillText( "Vx", velocity.x + 10, 0);
		}else if( velocity.x < -10){
			ctx.fillText( "Vx", velocity.x - 10, 0);
		}
		ctx.stroke();

		setColor("232, 244, 65");
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0,velocity.y);
		if( velocity.y > 10){
			ctx.fillText( "Vy", 0, velocity.y + 10);
		}else if( velocity.y < -10){
			ctx.fillText( "Vy", 0, velocity.y - 10);
		}
		ctx.stroke();

		setColor("65, 145, 244");
		ctx.beginPath();
		ctx.moveTo(0, 0);
		var theta = Math.atan(velocity.y/velocity.x);
		var velocity_net = Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2));
		if( velocity.x < 0 ){
			theta = Math.PI - theta
		}
		ctx.rotate(theta);
		ctx.lineTo(velocity_net,0);
		if( velocity_net > 10){
			ctx.fillText( "V", velocity_net + 10, 0);
		}
		ctx.stroke();
		setColor("255, 255, 255");
	}


	function updateFrame(timestamp) {
		// clear canvas
		ctx.clearRect(0,0,canvas.width,canvas.height);

		// determine if contact edge
		if( ball.x >= (size.x-ball.r)){
			collisionPhysics(DIRECTION_CONSTANT.X);
			is_at_edge.x = 1;
		}else if( ball.x <= ball.r ){
			collisionPhysics(DIRECTION_CONSTANT.X);
			is_at_edge.x = -1;
		}else{
			is_at_edge.x = 0;
		}
		if( ball.y >= size.y-ball.r ){
			collisionPhysics(DIRECTION_CONSTANT.Y);
			is_at_edge.y = 1;
		}else if( ball.y <= ball.r){
			collisionPhysics(DIRECTION_CONSTANT.Y);
			is_at_edge.y = -1;
		}else{
			is_at_edge.y = 0;
		}

		var dt = (timestamp - startTime)/1000.0;
		updatePhysics(dt);
		drawHistoryPath();
		drawBall();

		startTime = timestamp;
		requestAnimationFrame(function(timestamp){
			updateFrame(timestamp);
		});
	}

	requestAnimationFrame(function(timestamp){
		acc = {x: gravityXlider.value, y: gravityYlider.value};
		coefrest = restitutionSlider.value/1000.0;
		startTime = timestamp;
		initBall();
		updateFrame(timestamp);
	});
	
	gravityXlider.oninput = function() {
		acc.x = this.value;
	};
	gravityYlider.oninput = function() {
		acc.y = this.value;
	};
	restitutionSlider.oninput = function() {
		coefrest = this.value/1000.0;
		console.log(this.value/1000.0);
	};


}
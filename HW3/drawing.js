
window.onload = function(){
	

	var zoomSlider = document.getElementById('zoom');
	var speedXSlider = document.getElementById('speedX');
	var speedYSlider = document.getElementById('speedY');
	var speedZSlider = document.getElementById('speedZ');
	//var viewXSlider = document.getElementById('viewX');
	//var viewYSlider = document.getElementById('viewY');
	//var viewZSlider = document.getElementById('viewZ');

	var wrapper = document.getElementsByClassName('wrapper')[0];
	var canvas = document.getElementById('theCanvas');
	var size = {y: canvas.height, x: canvas.width};
	var ctx = canvas.getContext('2d');
	var radius = 350;
	var sphere = 0;
	var rotation = new Rotation(0,0,0);
	var viewRotation = new Rotation(0,0,0);
	var rotSpeed = {x: 1, y: 1, z:1 };
	var m4 = twgl.m4;
	var zoom = 1;

	function radians(deg){
		return deg / 180.0 * Math.PI;
	}

	function Rotation(degX, degY, degZ, convert){
		this.x = (typeof(degX) == "undefined") ? radians(10) : degX;
		this.y = (typeof(degY) == "undefined") ? radians(10) : degY;
		this.z = (typeof(degZ) == "undefined") ? radians(10) : degZ;
		if(convert){
			this.x = radians(this.x);
			this.y = radians(this.y);
			this.z = radians(this.z);
		}

		// for compatibility with m4
		this.getArray = function(){
			return [this.x,this.y,this.z];
		}
	}

	function Point(x,y,z){
		this.x = (typeof(x) == "undefined") ? 10.0 : x;
		this.y = (typeof(y) == "undefined") ? 10.0 : y;
		this.z = (typeof(z) == "undefined") ? 10.0 : z;

		// for compatibility with m4
		this.getArray = function(){
			return [this.x,this.y,this.z];
		}

		this.setArray = function(newArray){
			this.x = newArray[0];
			this.y = newArray[1];
			this.z = newArray[2];
			return ;
		}

		this.setVec3 = function(newVec3){
			this.x = newVec3.x;
			this.y = newVec3.y;
			this.z = newVec3.z;
			return ;
		}
	}

	function Sphere(r){
		this.points = new Array();
		this.color = "rgb(255,255,255,0)";
		this.numPoints = 0;
		this.pitch = 5;
		this.radius = (typeof(r) == "undefined") ? 10.0 : r;

		// create center circle at
		for( theta = 0; theta < radians(360); theta += radians(this.pitch) ){
			p = this.points[this.numPoints] = new Point();
			p.x = Math.cos(theta) * this.radius;
			p.y = 0;
			p.z = Math.sin(theta) * this.radius;
			this.numPoints++;
		}

		// create layers of smaller circle with axis in y.
		// +/-1 for +/- side of y
		for( side = 1; side >= -1; side -= 2){
			for( alpha = 0; alpha <= radians(90); alpha += radians(this.pitch)){
				var radius  = Math.cos(alpha) * this.radius;
				var yIndex = Math.sin(alpha) * this.radius;
				for( beta = 0; beta < radians(360); beta += radians(this.pitch)){
					p = this.points[this.numPoints] = new Point(0,yIndex * side,0);
					p.x = Math.cos(beta) * radius;
					p.z = Math.sin(beta) * radius;
					this.numPoints++;
				}
			}
		}

	}

	function drawPoint(point, zoom, rotation){

		//var rotX = m4.rotationX(rotation.x);
		//var rotY = m4.rotationY(rotation.y);
		//var rotZ = m4.rotationZ(rotation.z);
		//var rot = m4.multiply(m4.multiply(rotX, rotY),rotZ);
		//point.setArray(m4.transformPoint(rot,point.getArray()));

		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = point.z <= 0 ? "rgb(255,255,255)" : "rgb(0,200,0)";
		zoom = (typeof(zoom) == undefined) ? 1.0 : zoom;
		var dot_radius = point.z <= 0 ? 2 : 0.5;
		ctx.arc(point.x * zoom, point.y * zoom, dot_radius * zoom, 0, radians(360));
		ctx.fill();
		ctx.restore();
		ctx.closePath();
	}

	function renderSphere(){
		var p = new Point();
		sphere = new Sphere(radius);
	}

	function rotate(p,rotation){
		var rotX = m4.rotationX(rotation.x);
		var rotY = m4.rotationY(rotation.y);
		var rotZ = m4.rotationZ(rotation.z);
		var rot = m4.multiply(m4.multiply(rotX, rotY),rotZ);
		return m4.transformPoint(rot,p.getArray());
	}
	function updateFrame(timestamp) {
		// clear canvas
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.save();
		ctx.translate(size.x/2, size.y/2);
		var dt = timestamp - startTime;

		for( var pointIndex = 0; pointIndex < sphere.numPoints; pointIndex++){

			rotation.x = radians(rotSpeed.x * dt / 1000.0);
			rotation.y = radians(rotSpeed.y * dt / 1000.0);
			rotation.z = radians(rotSpeed.z * dt / 1000.0);

			sphere.points[pointIndex].setArray(rotate(sphere.points[pointIndex], rotation));
			drawPoint(sphere.points[pointIndex], zoom);
		}
		ctx.restore();
		startTime = timestamp;
		requestAnimationFrame(function(timestamp){
			updateFrame(timestamp);
		});
	}

	requestAnimationFrame(function(timestamp){
		startTime = timestamp;
		renderSphere();
		updateFrame(timestamp);
	});
	
	zoomSlider.oninput = function() {
		zoom = this.value / 100.0;
	};
	speedXSlider.oninput = function() {
		rotSpeed.x = this.value / 10.0;
	};
	speedYSlider.oninput = function() {
		rotSpeed.y = this.value / 10.0;
	};
	speedZSlider.oninput = function() {
		rotSpeed.z = this.value / 10.0;
	};
	//viewXSlider.oninput = function() {
	//	viewRotation.x = radians(this.value);
	//};
	//viewYSlider.oninput = function() {
	//	viewRotation.y = radians(this.value);
	//};
	//viewZSlider.oninput = function() {
	//	viewRotation.z = radians(this.value);
	//};


}
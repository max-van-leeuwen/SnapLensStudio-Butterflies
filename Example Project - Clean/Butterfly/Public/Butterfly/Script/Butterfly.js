// Max van Leeuwen
// maxvanleeuwen.com/lensstudio-butterflies
// ig: @max.van.leeuwen
// tw: @maksvanleeuwen



//@input Component.RenderMeshVisual wingLeft
//@input Component.RenderMeshVisual wingRight



var controller;

// movement
const territoryCheckTime = 1; 			// how often to check (seconds) if out of max radius around following position
const impulseChance = .1; 				// each territory check, have a chance (0-1) at new directional impulse

// flying animation
const wingRotateAmount = 100; 			// wing flapping rotation amount (degrees)
const wingFlapDuration = .1; 			// wing flapping duration in seconds when flying

// when landing on world mesh is enabled
const worldMeshCheckInterval = 10; 		// frames interval for raycasting
const worldMeshRaycastDistance = 14; 	// raycasting distance
const worldMeshMaxRestingTime = 10; 	// max landing time on world mesh in seconds
const worldMeshNormalUpThreshold = .7; 	// only land on surfaces with normals pointing up in world space, 0-1 threshold



var trf = script.getTransform();
var oldPos = trf.getWorldPosition();
var landingSpot;
var allClassificationsAllowed;



script.api.thisButterflyIndex; // the index of this butterfly, could be useful for making some butterflies behave differently



script.api.start = function(mainController, wingMat){
	controller = mainController;

	script.wingLeft.addMaterial(wingMat);
	script.wingRight.addMaterial(wingMat);

	startFlying();
}



function startFlying(){
	stopFlapping = false;
	landingSpot = undefined;

	if(restingFlappingEvent){
		script.removeEvent(restingFlappingEvent);
		restingFlappingEvent = undefined;
	}
	if(stayInPlaceEvent){
		script.removeEvent(stayInPlaceEvent);
		stayInPlaceEvent = undefined;
	}

	allClassificationsAllowed = controller.api.landOnClassifications.length === 7; // do not check each index if all are allowed

	var randomOffset = Math.random() * wingFlapDuration*2;
	delaySeconds(startFlapping, randomOffset);
	startMoving();
}



var xMoveOffset;
var yMoveOffset;
var zMoveOffset;
var xMoveSpeed;
var yMoveSpeed;
var zMoveSpeed;

function setPersonality(){
	xMoveOffset = Math.random()*2*Math.PI;
	yMoveOffset = Math.random()*2*Math.PI;
	zMoveOffset = Math.random()*2*Math.PI;

	var directionalSpeed = controller.api.directionalSpeed;
	xMoveSpeed = (Math.random()*2-1) * directionalSpeed;
	yMoveSpeed = (Math.random()*2-1) * directionalSpeed;
	zMoveSpeed = (Math.random()*2-1) * directionalSpeed;
}



function startMoving(){
	setPersonality();

	var shouldGoToTerritory = false;
	var territoryCheckCountdown = territoryCheckTime;
	function moveUpdate(){
		if(landingSpot){
			trf.setWorldPosition(landingSpot.position);
			if(landingSpot.orientation) trf.setWorldRotation(landingSpot.orientation);

			stopFlapping = true;

			restingFlappingAnimation();
			var stopRestingAfter = Math.random() * worldMeshMaxRestingTime;
			delaySeconds(startFlying, stopRestingAfter);

			script.removeEvent(moveEvent);
			return;
		}

		var isWorldTracking = controller.api.landOnWorldMesh && controller.api.deviceTrackingComponent;

		var xMoveDirection = Math.sin(getTime()*xMoveSpeed + xMoveOffset);
		var yMoveDirection = Math.sin(getTime()*yMoveSpeed + yMoveOffset);
		var zMoveDirection = Math.sin(getTime()*zMoveSpeed + zMoveOffset);

		var dPos = new vec3(xMoveDirection, yMoveDirection, zMoveDirection);

		var movingSpeed = controller.api.movingSpeed;
		var dSpeed = movingSpeed*getDeltaTime();

		if(territoryCheckCountdown < 0){
			shouldGoToTerritory = !isInTerritory(oldPos);
			territoryCheckCountdown = territoryCheckTime;
		}else{
			territoryCheckCountdown -= getDeltaTime();
			if(Math.random() < impulseChance){
				setPersonality();
			}
		}

		var followTransform = controller.api.followTransform;
		var followStrength = controller.api.followStrength;
		var tPos = shouldGoToTerritory ? followTransform.getWorldPosition().sub(oldPos).uniformScale( followStrength*getDeltaTime() ).clampLength(dSpeed) : vec3.zero(); // moving out of territory, added on top of dPos
		var newPos = oldPos.add(dPos.uniformScale(dSpeed));
		newPos = newPos.add(tPos);

		if(isWorldTracking && controller.api.avoidCollision) newPos = collisionCorrected(oldPos, newPos); // skip territory following when collision is detected
		trf.setWorldPosition(newPos);
		var traveledPos = newPos.sub(oldPos);
		oldPos = newPos;

		setOrientation(traveledPos);
		if(isWorldTracking) worldMeshCheck(); // only do world mesh check if landing is enabled and tracking component is found
	}
	var moveEvent = script.createEvent("UpdateEvent");
	moveEvent.bind(moveUpdate);
}



function setOrientation(dPos){
	var lookAt = quat.lookAt(dPos, vec3.up());
	if(isFinite(lookAt.x) &&
	   isFinite(lookAt.y) &&
	   isFinite(lookAt.z) &&
	   isFinite(lookAt.w) ){
		trf.setWorldRotation(lookAt);
	}
}



function collisionCorrected(oldPos, newPos){
	var raycastVector = newPos.sub(oldPos);
	var length = raycastVector.length;
	var hitArray = controller.api.deviceTrackingComponent.raycastWorldMesh(oldPos, newPos);

	if(hitArray.length > 0){
		var hit = hitArray[0];
		if(hit.position.distance(oldPos) < length){
			var invertedRaycastVector = raycastVector.uniformScale(-1);
			setPersonality();
			return oldPos.add(invertedRaycastVector);
		}
	}
	return newPos
}



var worldMeshCountDown = Math.round(Math.random() * worldMeshCheckInterval); // random start to interval for variation per butterfly
var trackingInitialized;
function worldMeshCheck(){
	if(!trackingInitialized && controller.api.thisButterflyIndex === 0){ // on the first butterfly, check if the Tracking Component is initialized
		controller.api.deviceTrackingComponent.worldOptions.enableWorldMeshesTracking = true;
		if(!allClassificationsAllowed) controller.api.deviceTrackingComponent.worldOptions.enableWorldMeshesClassificationTracking = true;
		trackingInitialized = true;
	}

	if(worldMeshCountDown < 0){
		worldMeshCountDown = worldMeshCheckInterval;
		doWorldMeshCheck();
	}else{
		worldMeshCountDown--;
	}

	function doWorldMeshCheck(){
		var thisPos = trf.getWorldPosition();
		var raycastVector = trf.forward;
		var hitArray = controller.api.deviceTrackingComponent.raycastWorldMesh(thisPos, thisPos.add(raycastVector));

		if(hitArray.length > 0){
			var hit = hitArray[0];
			var hitDistance = hit.position.distance(thisPos);
			if(hitDistance < worldMeshRaycastDistance){// if within max search distance
				if(!allClassificationsAllowed){
					if(controller.api.landOnClassifications.indexOf(hit.classification) === -1) { // if notone of specified classifications
						return;
					}
				}
			}else{
				return;
			}

			var surfacePointingUp = hit.normal.dot(vec3.up());
			if(surfacePointingUp > worldMeshNormalUpThreshold){ // only land on surfaces facing up
				var orientation = quat.lookAt(hit.normal, vec3.up());
				var rotateBy = quat.angleAxis(Math.PI/2, vec3.right());
				orientation = orientation.multiply(rotateBy);

				if(!isFinite(orientation.x) ||
				   !isFinite(orientation.y) ||
				   !isFinite(orientation.z) ||
				   !isFinite(orientation.w) ){
					orientation = undefined;
				}

				landingSpot = { "position":hit.position,
								"orientation":orientation};
			}
		}
	}
}



function startFlapping(){
	wingFlapAnimate(script.wingLeft.getSceneObject().getParent(), true, 'in', false, 1);
	wingFlapAnimate(script.wingRight.getSceneObject().getParent(), false, 'in', false, 1);
}



var restingFlappingEvent;
var stayInPlaceEvent;
function restingFlappingAnimation(){
	const restingAnimationIntervalIncrease = 3;
	const restingAnimationIntervalMax = 12;

	const longerFlappingDuration = 4;
	const maxFlappingDurationMultiplier = 7;

	var offset = restingAnimationIntervalIncrease;
	var durationMultiplier = longerFlappingDuration;

	function flapOnce(){
		durationMultiplier = Math.min(durationMultiplier + longerFlappingDuration, maxFlappingDurationMultiplier);
		wingFlapAnimate(script.wingLeft.getSceneObject().getParent(), true, 'in', true, durationMultiplier);
		wingFlapAnimate(script.wingRight.getSceneObject().getParent(), false, 'in', true, durationMultiplier);

		var newWingFlapDuration = wingFlapDuration * durationMultiplier;
		var waitFlap = (newWingFlapDuration * 2) + (Math.random() * offset);
		offset = Math.min(offset + restingAnimationIntervalIncrease, restingAnimationIntervalMax);

		restingFlappingEvent = delaySeconds(flapOnce, waitFlap);
	}
	flapOnce();


	function stayInPlace(){
		trf.setWorldPosition(oldPos);
		if(!controller.api.landOnWorldMesh) startFlying();
	}
	stayInPlaceEvent = script.createEvent("UpdateEvent");
	stayInPlaceEvent.bind(stayInPlace);
}



var stopFlapping;
function wingFlapAnimate(obj, isLeftWing, version, once, durationMult){
	var from;
	var to;
	var duration = wingFlapDuration * durationMult;

	switch(version){
		case "in":
			from = 0;
			to = 1;
			break
		case "out":
			from = 1;
			to = 0;
			break
	}

	var wingOpen = once ? wingRotateAmount/2 : wingRotateAmount;
	function setValue(v){
		var newRotationEuler = new vec3(isLeftWing ? -wingOpen*v : wingOpen*v, 0, 0);
		var newRotation = quat.fromEulerVec( degToRad(newRotationEuler));
		if(isFinite(newRotation.x) &&
		   isFinite(newRotation.y) &&
		   isFinite(newRotation.z) &&
		   isFinite(newRotation.w) ){
			obj.getTransform().setLocalRotation(newRotation);
		}
	}

	var anim = 0;
	function animation(){
		anim += getDeltaTime()/duration;
		var v = interp(clamp(anim, 0, 1), from, to);
		setValue(v);
		if(anim > 1){
			script.removeEvent(wingFlapEvent);

			if((!stopFlapping || version == 'in') && !(version == 'out' && once)){
				wingFlapAnimate(obj, isLeftWing, version === 'in' ? 'out' : 'in', once, durationMult); // flap other direction
			}
		}
	}
	var wingFlapEvent = script.createEvent("UpdateEvent");

	function startAnim(){
		wingFlapEvent.bind(animation);
	}

	startAnim();
}



function isInTerritory(pos){
	var followTransform = controller.api.followTransform;
	var center = followTransform.getWorldPosition();
	var size = controller.api.followRadius;

	return !( pos.x < center.x-size ||
			  pos.x > center.x+size ||
			  pos.y < center.y-size ||
			  pos.y > center.y+size ||
			  pos.z < center.z-size ||
			  pos.z > center.z+size );
}



function QuadraticInOut(k) {
	if ((k *= 2) < 1) {
		return 0.5 * k * k;
	}
	return - 0.5 * (--k * (k - 2) - 1);
}



function interp(t, startValue, endValue){
	return QuadraticInOut(t) * (endValue-startValue) + startValue;
}



function delaySeconds(func, wait, args){
	const keepAlive = {
		exec: function(){
			_args = args;
			func.apply(null, _args);
		}
	}
	var waitEvent = script.createEvent("DelayedCallbackEvent");
	waitEvent.bind(keepAlive.exec.bind(keepAlive));
	waitEvent.reset(wait);
	return waitEvent;
}



function degToRad(degrees){
	var _x = degrees.x * Math.PI/180;
	var _y = degrees.y * Math.PI/180;
	var _z = degrees.z * Math.PI/180;
	return new vec3(_x, _y, _z);
}



function clamp(value, low, high){
	return Math.max(Math.min(value, Math.max(low, high)), Math.min(low, high));
}
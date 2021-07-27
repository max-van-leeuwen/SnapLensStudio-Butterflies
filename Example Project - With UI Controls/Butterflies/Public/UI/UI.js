// Max van Leeuwen
// maxvanleeuwen.com/lensstudio-butterflies
// ig: @max.van.leeuwen
// tw: @maksvanleeuwen



//@input Component.Script butterflyController
//@input vec4 activeColor
//@input vec4 inactiveColor



var followHeightStart = script.butterflyController.api.followTransform.getWorldPosition().y;



//@input SceneObject UIRegion
function init(){
	var isSpectacles = global.deviceInfoSystem.isSpectacles();

	script.api.toggleWorldMeshOcclusion();
	if(!isSpectacles) script.api.toggleWorldMeshOcclusion();

	script.api.toggleTablesChairsOnly();
	if(!isSpectacles) script.api.toggleTablesChairsOnly();

	script.api.toggleWorldMeshLanding();
	if(!isSpectacles) script.api.toggleWorldMeshLanding();

	script.api.toggleAvoidCollisions();


	if(isSpectacles){
		script.UIRegion.enabled = false;
	}

	if(!isSpectacles) touchStartEvent.bind(moveToTap);

	script.api.toggleUI();
}
delay(init);



function getTextComponent(scriptComponent){
	return scriptComponent.getSceneObject().getChild(0).getChild(0).getComponent("Component.Text");
}



//@input Component.DeviceTracking deviceTracking
function moveToTap(eventData){
	var pos = eventData.getTapPosition();
	var hit = script.deviceTracking.hitTestWorldMesh(pos)[0];
	if(hit){
		var worldPos = hit.position;
		var curFollowTrf = script.butterflyController.api.followTransform;
		var curPosition = curFollowTrf.getWorldPosition();
		var newPosition = new vec3(worldPos.x, curPosition.y, worldPos.z);
		curFollowTrf.setWorldPosition(newPosition);
	}
}
var touchStartEvent = script.createEvent("TapEvent");



//@input SceneObject worldMeshOccluder
//@input Component.Script occludeWorldMesh
script.api.toggleWorldMeshOcclusion = function(){
	var curValue = script.worldMeshOccluder.enabled;
	if(curValue){
		getTextComponent(script.occludeWorldMesh).textFill.color = script.inactiveColor;
	}else{
		getTextComponent(script.occludeWorldMesh).textFill.color = script.activeColor;
	}
	script.worldMeshOccluder.enabled = !curValue;
}



//@input Component.Script tablesChairsOnly
script.api.toggleTablesChairsOnly = function(){
	var curClassifications = script.butterflyController.api.landOnClassifications;
	var newClassifications;
	if(curClassifications.length === 2){
		newClassifications = [1, 2, 3, 4, 5, 6, 7];
		getTextComponent(script.tablesChairsOnly).textFill.color = script.inactiveColor;
	}else{
		newClassifications = [4, 5];
		getTextComponent(script.tablesChairsOnly).textFill.color = script.activeColor;
	}
	script.butterflyController.api.landOnClassifications = newClassifications;
}



//@input Component.Script toggleWorldMeshLanding
script.api.toggleWorldMeshLanding = function(){
	var curValue = script.butterflyController.api.landOnWorldMesh;
	if(curValue){
		getTextComponent(script.toggleWorldMeshLanding).textFill.color = script.inactiveColor;
	}else{
		getTextComponent(script.toggleWorldMeshLanding).textFill.color = script.activeColor;
	}
	script.butterflyController.api.landOnWorldMesh = !curValue;
}



//@input Component.Script toggleAvoidCollisions
script.api.toggleAvoidCollisions = function(){
	var curValue = script.butterflyController.api.avoidCollision;
	if(curValue){
		getTextComponent(script.toggleAvoidCollisions).textFill.color = script.inactiveColor;
	}else{
		getTextComponent(script.toggleAvoidCollisions).textFill.color = script.activeColor;
	}
	script.butterflyController.api.avoidCollision = !curValue;
}



//@input Component.Script colorOffsetSlider
script.api.colorOffset = function(){
	var sliderValue = script.colorOffsetSlider.api.getSliderValue();
	var materialsList = script.butterflyController.api.materials;
	for(var i = 0; i < materialsList.length; i++){
		materialsList[i].mainPass.colorOffset = sliderValue;
	}
}



//@input Component.Script spawnCountSlider
//@input int minSpawnCount
//@input int maxSpawnCount
script.api.setSpawnCount = function(){
	resetSpawn();
}



//@input Component.Script radiusSlider
//@input float minRadius
//@input float maxRadius
script.api.setRadius = function(){
	var sliderValue = script.radiusSlider.api.getSliderValue();
	var radius = sliderValue * (script.maxRadius - script.minRadius) + script.minRadius;
	script.butterflyController.api.followRadius = radius;

	var curFollowTrf = script.butterflyController.api.followTransform;
	var curPosition = curFollowTrf.getWorldPosition();
	var newPosition = new vec3(curPosition.x, followHeightStart + radius, curPosition.z);
	curFollowTrf.setWorldPosition(newPosition);

	resetSpawn();
}



//@input Component.Script heightSlider
//@input float minHeight
//@input float maxHeight
script.api.setHeight = function(){
	var sliderValue = script.heightSlider.api.getSliderValue();
	var height = sliderValue * (script.maxHeight - script.minHeight) + script.minHeight;
	followHeightStart = height;

	var sliderValue = script.radiusSlider.api.getSliderValue();
	var radius = sliderValue * (script.maxRadius - script.minRadius) + script.minRadius;

	var curFollowTrf = script.butterflyController.api.followTransform;
	var curPosition = curFollowTrf.getWorldPosition();
	var newPosition = new vec3(curPosition.x, followHeightStart + radius, curPosition.z);
	curFollowTrf.setWorldPosition(newPosition);
}



var UI = true;
script.api.toggleUI = function(){
	UI = !UI;
	script.tablesChairsOnly.getSceneObject().enabled = UI;
	script.toggleWorldMeshLanding.getSceneObject().enabled = UI;
	script.colorOffsetSlider.getSceneObject().enabled = UI;
	script.spawnCountSlider.getSceneObject().enabled = UI;
	script.radiusSlider.getSceneObject().enabled = UI;
	script.occludeWorldMesh.getSceneObject().enabled = UI;
	script.heightSlider.getSceneObject().enabled = UI;
	script.toggleAvoidCollisions.getSceneObject().enabled = UI;
}



function resetSpawn(){
	var sliderValue = script.spawnCountSlider.api.getSliderValue();
	var amount = sliderValue * (script.maxSpawnCount - script.minSpawnCount) + script.minSpawnCount;
	script.butterflyController.api.removeButterflies();
	script.butterflyController.api.spawnButterflies(amount);
}



function delay(func){
	var wait = 1;
	function onUpdate(){
		if(wait <= 0){
			script.removeEvent(waitEvent);
			func();
		}
		wait--;
	}
	var waitEvent = script.createEvent("UpdateEvent");
	waitEvent.bind(onUpdate);
}
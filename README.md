An asset for Lens Studio that instantly adds butterflies to your scene.

If your device has Lidar, they can even land on it and avoid collisions with it!

Try [a demo of the butterflies in Snapchat here](https://lens.snapchat.com/16b62e0418ea4e7594da451df1e9da61).

From [maxvanleeuwen.com/lensstudio-butterflies](https://maxvanleeuwen.com/lensstudio-butterflies)



![butterflies in lens studio](https://maxvanleeuwen.com/wp-content/uploads/Butterflies_thumb.gif)



<pre><code>
It works without any coding!
If you want to change parameters for the butterflies on runtime, this is what you could use:



- Spawn a number of butterflies (n is a whole number). This function is called on start if 'spawnOnStart' is more than 0.
	script.api.spawnButterflies(n)



- Remove all currently instanced butterflies
	script.api.removeButterflies()



- Get or set the butterfly moving speed
	script.api.movingSpeed



- Get or set the 'hyperactive' character trait of the butterflies
	script.api.directionalSpeed



- Get or set the random sizes of newly spawned butterflies (vec2 containing min, max)
	script.api.randomSize



- Get or set the strength at which butterflies follow the transform
	script.api.followStrength



- Get or set the radius around the followed transform to stay in (world space)
	script.api.followRadius



- Get or set the transform for butterflies to follow (uses position only, default is this Butterfly Controller's Transform)
	script.api.followTransform



- Get or set whether butterflies should always be above ground level (world y = 0)
	script.api.alwaysAboveGround



- Get or set whether butterflies should land on the world mesh occasionally (world mesh generation/lidar needed) - when ebabled, script.api.deviceTrackingComponent is required for it to work!
	script.api.landOnWorldMesh



- Get or set whether butterflies should avoid collisions with the world mesh (slower, especially when there are a lot of butterflies flying around)
	script.api.avoidCollision



- Get or set the Device Tracking Component needed (necessary when landing on world mesh is enabled)
	script.api.deviceTrackingComponent



- Get or set the world mesh classifications that butterflies can land on (indices, from lensstudio.snapchat.com/api/classes/TrackedMeshFaceClassification)
	script.api.landOnClassifications



- Get the array of currently instanced butterfly Scene Objects
	script.api.butterflies
> ⚠️ **This project is outdated, it was built using Lens Studio 4.0.1 and I'm planning to update it soon.

---


# Butterflies 🦋

An asset for Lens Studio that instantly adds butterflies to your scene.

If your device has Lidar, they can even land on the world mesh and avoid collisions with it!

[Try a demo of the butterflies in Snapchat here](https://lens.snapchat.com/16b62e0418ea4e7594da451df1e9da61).  
From [maxvanleeuwen.com/lensstudio-butterflies](https://maxvanleeuwen.com/lensstudio-butterflies)

![Butterflies in Lens Studio](https://maxvanleeuwen.com/wp-content/uploads/Butterflies_thumb.gif)

<br>

---

- **Lidar Support:** Butterflies can land on objects and avoid collisions in your scene if your device supports Lidar.
- **No Coding Required:** Fully functional out of the box, but customizable for developers.

---

<br>

### Available API Functions

#### Spawn and Remove Butterflies
- **Spawn a number of butterflies** (n is a whole number). This function is called on start if `spawnOnStart` is more than 0.
    ```js
    .spawnButterflies(n)
    ```

- **Remove all currently instanced butterflies**.
    ```js
    .removeButterflies()
    ```

#### Butterfly Movement
- **Moving speed**: Get or set the butterfly moving speed.
    ```js
    .movingSpeed
    ```

- **Hyperactive behavior**: Get or set the 'hyperactive' character trait of the butterflies.
    ```js
    .directionalSpeed
    ```

#### Appearance
- **Random sizes**: Get or set the random sizes of newly spawned butterflies (vec2 containing min, max).
    ```js
    .randomSize
    ```

#### Follow Behavior
- **Follow strength**: Get or set the strength at which butterflies follow the transform.
    ```js
    .followStrength
    ```

- **Follow radius**: Get or set the radius around the followed transform to stay in (world space).
    ```js
    .followRadius
    ```

- **Follow transform**: Get or set the transform for butterflies to follow (uses position only, default is this Butterfly Controller's Transform).
    ```js
    .followTransform
    ```

#### Ground and World Mesh Interaction
- **Stay above ground**: Get or set whether butterflies should always be above ground level (world y = 0).
    ```js
    .alwaysAboveGround
    ```

- **Land on world mesh**: Get or set whether butterflies should land on the world mesh occasionally (requires world mesh generation/Lidar). When enabled, `.deviceTrackingComponent` is required for it to work.
    ```js
    .landOnWorldMesh
    ```

- **Avoid collisions with world mesh**: Get or set whether butterflies should avoid collisions with the world mesh (slower when there are many butterflies flying around).
    ```js
    .avoidCollision
    ```

- **Device Tracking Component**: Get or set the Device Tracking Component needed when landing on the world mesh is enabled.
    ```js
    .deviceTrackingComponent
    ```

- **World mesh classifications**: Get or set the world mesh classifications that butterflies can land on (indices, from [Lens Studio API](https://lensstudio.snapchat.com/api/classes/TrackedMeshFaceClassification)).
    ```js
    .landOnClassifications
    ```

---

### Butterfly Instances
- **Access butterflies**: Get the array of currently instanced butterfly Scene Objects.
    ```js
    .butterflies
    ```

---

// UIButton.js
// Version: 0.1.1
// Event: Initialized Event
// Description: Trigger events and behaviors by press.
//
// ----- USAGE -----
// Attach this script to a Scene Object with a Screen Transform Component.
// Assign a Screen Image Object to the "Background Object" parameter
// 
// ----- LOCAL API USAGE -----
// Valid Event Types: "onEnableInteractable", "onDisableInteractable", "onPressDown", "onPressUp", "onPress"
//
// Manually enable interactable
// script.api.enableInteractable()
//
// Manually disable interactable
// script.api.disableInteractable()
//
// True if interactable
// script.api.isInteractable()
//
// Add callback function to event
// script.api.addCallback(eventType, callback)
//
// Remove callback function from event
// script.api.removeCallback(eventType, callback)
//
// True if pressed
// script.api.isPressed()
//
// Enable touch events
// script.api.enableTouchEvents()
//
// Disable touch events
// script.api.disableTouchEvents()
//
// Manually trigger Press Down (call only when touch events are disabled)
// script.api.pressDown()
//
// Manually trigger Press Up (call only when touch events are disabled)
// script.api.pressUp()
//
// Change this button's animation type to a newType ("Bounce", "Squish", "Tween", "AnchorPosition", "OffsetPosition", "Rotation", or "Scale")
// script.api.changeAnimationType(newType)
//
// Set the value of one of this UI Button’s transition types ("Color", "Texture", "Tween", "AnchorPosition", "OffsetPosition", "Rotation", or "Scale") for when it switches to a different state ("normal", "pressed", or "disabled")
// script.api.changeStateValue(state, type, newValue)
//
// Get the current color of the Button's Background
// script.api.getColor()
//
// Get the current texture of the Button's Background
// script.api.getTexture()
//
// -----------------

//@input bool interactable = true
//@ui {"widget":"separator"}

//@input bool useColors = true 
//@ui {"widget":"group_start", "label":"Colors", "showIf":"useColors"}
//@input vec4 normalColor = {1, 1, 1, 1} {"widget":"color"}
//@input vec4 pressedColor = {1, 1, 1, 1} {"widget":"color"}
//@input vec4 disabledColor = {1, 1, 1, 1} {"widget":"color"}
//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@input bool useTextures = true
//@ui {"widget":"group_start", "label":"Textures", "showIf":"useTextures"}
//@input Asset.Texture normalTexture
//@input Asset.Texture pressedTexture
//@input Asset.Texture disabledTexture
//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@input bool editAnimations = false
//@ui {"widget":"group_start", "label":"Animations", "showIf":"editAnimations"}
//@input int animation = 0 {"label":"Animation Type", "widget":"combobox", "values":[{"label":"None", "value":0}, {"label":"Bounce", "value":1}, {"label":"Squish", "value": 2}, {"label":"Tween", "value": 3}, {"label":"Transform", "value":4}]}

//@ui {"widget":"group_start", "label":"Transform Properties", "showIf":"animation", "showIfValue":4}
//@input string transformType = "OffsetPosition" {"widget":"combobox", "values":[{"label":"Offset Position", "value":"OffsetPosition"}, {"label":"Anchor Position", "value":"AnchorPosition"}, {"label":"Rotation", "value":"Rotation"}, {"label":"Scale", "value": "Scale"}]}

//@input vec2 normalAnchorPosition {"showIf":"transformType", "showIfValue":"AnchorPosition"}
//@input vec2 pressedAnchorPosition {"showIf":"transformType", "showIfValue":"AnchorPosition"}
//@input vec2 disabledAnchorPosition {"showIf":"transformType", "showIfValue":"AnchorPosition"}

//@input vec2 normalOffsetPosition {"showIf":"transformType", "showIfValue":"OffsetPosition"}
//@input vec2 pressedOffsetPosition {"showIf":"transformType", "showIfValue":"OffsetPosition"}
//@input vec2 disabledOffsetPosition {"showIf":"transformType", "showIfValue":"OffsetPosition"}

//@input float normalRotation {"showIf":"transformType", "showIfValue":"Rotation"}
//@input float pressedRotation {"showIf":"transformType", "showIfValue":"Rotation"}
//@input float disabledRotation {"showIf":"transformType", "showIfValue":"Rotation"}

//@input vec3 normalScale = {1.0, 1.0, 1.0} {"showIf":"transformType", "showIfValue":"Scale"}
//@input vec3 pressedScale {"showIf":"transformType", "showIfValue":"Scale"}
//@input vec3 disabledScale {"showIf":"transformType", "showIfValue":"Scale"}
//@ui {"widget":"group_end"}

//@input SceneObject sceneObjectWithTweens {"showIf":"animation", "showIfValue":3}
//@input string normalTween {"showIf":"animation", "showIfValue":3}
//@input string pressedTween {"showIf":"animation", "showIfValue":3}
//@input string disabledTween {"showIf":"animation", "showIfValue":3}
//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@input bool editEventCallbacks = false
//@ui {"widget":"group_start", "label":"Event Callbacks", "showIf":"editEventCallbacks"}
//@input int callbackType = 0 {"widget":"combobox", "values":[{"label":"None", "value":0}, {"label":"Behavior Script", "value": 1}, {"label":"Behavior Custom Trigger", "value":2}, {"label":"Custom Function", "value":3}]}

//@input Component.ScriptComponent[] onPressDownBehaviors {"label":"On Press Down Behaviors", "showIf":"callbackType", "showIfValue":1}
//@ui {"widget":"separator", "showIf":"callbackType", "showIfValue":1}
//@input Component.ScriptComponent[] onPressUpBehaviors {"label":"On Press Up Behaviors", "showIf":"callbackType", "showIfValue":1}
//@ui {"widget":"separator", "showIf":"callbackType", "showIfValue":1}
//@input Component.ScriptComponent[] onPressBehaviors {"label":"On Press Behaviors", "showIf":"callbackType", "showIfValue":1}

//@input string[] onPressDownGlobalBehaviors {"label":"On Press Down Custom Triggers", "showIf":"callbackType", "showIfValue":2}
//@ui {"widget":"separator", "showIf":"callbackType", "showIfValue":2}
//@input string[] onPressUpGlobalBehaviors {"label":"On Press Up Custom Triggers", "showIf":"callbackType", "showIfValue":2}
//@ui {"widget":"separator", "showIf":"callbackType", "showIfValue":2}
//@input string[] onPressGlobalBehaviors {"label":"On Press Custom Triggers", "showIf":"callbackType", "showIfValue":2}

//@input Component.ScriptComponent customFunctionScript {"showIf":"callbackType", "showIfValue":3}
//@input string[] onPressDownFunctionNames {"label":"On Press Down Functions", "showIf":"callbackType", "showIfValue":3}
//@ui {"widget":"separator", "showIf":"callbackType", "showIfValue":3}
//@input string[] onPressUpFunctionNames {"label":"On Press Up Functions", "showIf":"callbackType", "showIfValue":3}
//@ui {"widget":"separator", "showIf":"callbackType", "showIfValue":3}
//@input string[] onPressFunctionNames {"label":"On Press Functions", "showIf":"callbackType", "showIfValue":3}
//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@input bool editAdvancedOptions
//@ui {"widget":"group_start", "label":"Advanced Options", "showIf":"editAdvancedOptions"}
//@input bool printDebugStatements = false
//@input bool printWarningStatements = true
//@input bool disableTouchEvents = false
//@input bool editConnections = false
//@ui {"widget":"group_start", "label":"Connections", "showIf":"editConnections"}
//@input SceneObject backgroundObject
//@input Component.MaterialMeshVisual[] extraColorReceivers {"showIf":"useColors"}
//@ui {"widget":"group_end"}

//@ui {"widget":"group_end"}

var callbackTracker = new global.CallbackTracker(script);

// Local API
script.api.pressDown = pressDown;
script.api.pressUp = pressUp;
script.api.enableInteractable = enableInteractable;
script.api.disableInteractable = disableInteractable;
script.api.isPressed = isPressed;
script.api.isInteractable = isInteractable;
script.api.enableTouchEvents = enableTouchEvents;
script.api.disableTouchEvents = disableTouchEvents;
script.api.changeAnimationType = changeAnimationType;
script.api.changeStateValue = changeStateValue;
script.api.getStateValue = getStateValue;
script.api.getColor = getColor;
script.api.getTexture = getTexture;
script.api.initialized = false;
script.api.widgetType = global.WidgetTypes.UIButton;

script.api.addCallback = callbackTracker.addCallback.bind(callbackTracker);
script.api.removeCallback = callbackTracker.removeCallback.bind(callbackTracker);

script.api.getMainRenderOrder = getMainRenderOrder;
script.api.claimTouchStart = claimTouchStart;

script.api.setAutoResetEnabled = setAutoResetEnabled;

script.api.ownerScript = null;

// Touch Event callbacks
script.api.onTouchStart = onTouchStart;
script.api.onTouchEnd = onTouchEnd;
script.api.onTouchMove = onTouchMove;

script.api.allowTouchEvents = !script.disableTouchEvents;

var sceneObject = script.getSceneObject();

// Is this widget interactable?
var interactable = script.interactable;

// Relevant Components
var thisScreenTransform = null;
var backgroundScreenTransform = null;
var backgroundImage = null;

// Is this UI Button currently pressed?
var pressed = false;

// Last frame time the button was pressed. Used to detect if the object was disabled and unpress on enable.
var lastPressTime = null;
var autoResetEnabled = true;

// Stored animation states
var animations = {};
var animationTime = 0.15;
var transitionTime = 0.15;

// Default easing curve used for animations
const easingFunction = global.EasingHelpers.easeOutBack;

var transformAnimationHelper = new global.AnimationHelper(script, animationTime, null, null, null, null);
var transitionAnimationHelper = new global.AnimationHelper(script, transitionTime, null, null, null, null);

// Use for Tween Animation
var currentTween = null;

// Has this UI Button been triggered at least once before?
var initialTrigger = false;

var refreshHelper = new global.RefreshHelper(initParams);

script.api.setOwner = setOwner;
script.api.notifyOnInitialize = notifyOnInitialize;

initParams();

function refresh() {
    refreshHelper.requestRefresh();
}

function notifyOnInitialize(callback) {
    callback(script);
}

// Initialize all parameters
function initParams() {	
    if (script.api.initialized) {
        return;
    }
    if (!initButton() || 
		!initBackground() ||
		!initMaterial() ||
		!initAnimations() ||
		!initEvents() ||
		!initInteractable()) {
        return;
    }
    
    global.answerPoliteCalls(script, "notifyOnInitialize");
    checkOwner();

    script.api.initialized = true;
}

function claimTouchStart(touchPosition) {
    return (backgroundScreenTransform && backgroundScreenTransform.containsScreenPoint(touchPosition))
        ? global.TouchClaimTypes.Claim
        : global.TouchClaimTypes.Reject;
}

function getMainRenderOrder() {
    return backgroundImage ? backgroundImage.getRenderOrder() : null;
}

function seekOwner() {
    global.findScriptUpwards(sceneObject, "acceptChildWidget", function(scr) {
        return scr.api.acceptChildWidget(script);
    });
}

function setOwner(ownerScript) {
    script.api.ownerScript = ownerScript;
    refresh();
}

function checkOwner() {
    if (!script.api.ownerScript) {
        seekOwner();
    }
    return !!script.api.ownerScript;
}

function setAutoResetEnabled(enabled) {
    autoResetEnabled = enabled; 
}

// Initialize Button parameters
function initButton() {
    // Obtain the Screen Transform of this Button
    thisScreenTransform = sceneObject.getComponent("Component.ScreenTransform");
    if (!thisScreenTransform) {
        printWarning("missing a Screen Transform Component!");
        return false;
    }
    return true;
}

// Initalize Background parameters
function initBackground() {
    // Obtain the Background Scene Object
    if (!script.backgroundObject) {
        printWarning("no Reference to Background Scene Object! Attempting to search children...");
        script.backgroundObject = global.getChildByName(sceneObject, "Background");
        if (!script.backgroundObject) {
            printWarning("the Background Scene Object has not been assigned! Please go to \"Advanced Options\" and reassign it under \"Edit Connections\"!");
            return false;
        }
    }

    // Obtain Screen Transform Component from the Background
    backgroundScreenTransform = script.backgroundObject.getComponent("Component.ScreenTransform");
    if (!backgroundScreenTransform) {
        printWarning("background is missing a Screen Transform Component!");
        return false;
    }

    // Obtain Image Component from the Background
    backgroundImage = script.backgroundObject.getComponent("Component.Image");
    if (!backgroundImage) {
        printWarning("background is missing an Image Component!");
        return false;
    }

    return true;
}

function cloneAndReplaceMaterial(meshVisual) {
    var clone = meshVisual.mainMaterial.clone();
    meshVisual.mainMaterial = clone;
    return clone;
}

// Initialize material properties 
function initMaterial() {
    var backgroundMat = cloneAndReplaceMaterial(backgroundImage);

    // Initialize state colors
    if (!script.useColors) {
        script.normalColor = backgroundMat.mainPass.baseColor;
        script.pressedColor = backgroundMat.mainPass.baseColor;
        script.disabledColor = backgroundMat.mainPass.baseColor;
    }

    // Initialize extra color receivers
    var receivers = [backgroundImage];
    if (script.useColors && script.extraColorReceivers) {
        var extraReceivers = script.extraColorReceivers.filter(function(r) {
            if (r) {
                cloneAndReplaceMaterial(r);
                return true;
            }
        });
        receivers = receivers.concat(extraReceivers);
    }
    transitionAnimationHelper.configureForMeshVisualColor(receivers);

    // Initialize state textures
    if (!script.useTextures) {
        script.normalTexture = backgroundMat.mainPass.baseTex;
        script.pressedTexture = backgroundMat.mainPass.baseTex;
        script.disabledTexture = backgroundMat.mainPass.baseTex;
    } else {
        script.normalTexture = script.normalTexture || backgroundMat.mainPass.baseTex;
        script.pressedTexture = script.pressedTexture || backgroundMat.mainPass.baseTex;
        script.disabledTexture = script.disabledTexture || backgroundMat.mainPass.baseTex;
    }

    setTexture(interactable ? script.normalTexture : script.disabledTexture);
    return true;
}

// Calculate animated rotation and scale values
function initAnimations() {
    switch (script.animation) {
        case 1: // Bounce
            animations.normal = backgroundScreenTransform.scale;
            animations.pressed = animations.normal.uniformScale(0.8);
            animations.disabled = animations.normal;
            
            transformAnimationHelper.configureForScreenTransformSize(backgroundScreenTransform, easingFunction);
            break;
        case 2: // Squish
            animations.normal = backgroundScreenTransform.scale;
            animations.pressed = animations.normal.scale(new vec3(1.1, .8, 1));
            animations.disabled = animations.normal;

            transformAnimationHelper.configureForScreenTransformSize(backgroundScreenTransform, easingFunction);

            break;
        case 4: // Transform
            animations.normal = script["normal" + script.transformType];
            animations.pressed = script["pressed" + script.transformType];
            animations.disabled = script["disabled" + script.transformType];

            if (script.transformType == "OffsetPosition") {
                transformAnimationHelper.configureForScreenTransformOffsetPosition(backgroundScreenTransform, easingFunction);
            } else if (script.transformType == "AnchorPosition") {
                transformAnimationHelper.configureForScreenTransformAnchorPosition(backgroundScreenTransform, easingFunction);
            } else if (script.transformType == "Rotation") {
                transformAnimationHelper.configureForScreenTransformRotation(backgroundScreenTransform, easingFunction);
            } else if (script.transformType == "Scale") {
                transformAnimationHelper.configureForScreenTransformSize(backgroundScreenTransform, easingFunction);
            }
            break;
    }

    animations.currentAnimationState = "normal";
    return true;
}

// Initialize events and behaviors
function initEvents() {
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(onUpdate);
    return true;
}

// Initialize this Interactable
function initInteractable() {
    var state = interactable ? "normal" : "disabled";
    invokeVisualTransition(state);
    invokeAnimation(state, script.animation);
    return true;
}

// Remove all Touch Events
function disableTouchEvents() {
    script.api.allowTouchEvents = false;
    script.disableTouchEvents = true;
}

// Enable touch event
function enableTouchEvents() {
    script.api.allowTouchEvents = true;
    script.disableTouchEvents = false;
}

// Called On Touch Start
function onTouchStart(eventData) {
    if (!interactable) {
        return;
    }
    pressDown();
    callbackTracker.invokeScriptedCallbacks("onTouchStart", eventData);
}

// Called On Touch End
function onTouchEnd(eventData) {
    if (!interactable) {
        return;
    }
    pressUp();
    callbackTracker.invokeScriptedCallbacks("onTouchEnd", eventData);
}

// Called On Touch Move
function onTouchMove(eventData) {
    if (!interactable) {
        return;
    }
    touchOffBoundsCheck(eventData);
    callbackTracker.invokeScriptedCallbacks("onTouchMove", eventData);
}

// Return true if button is currently being pressed, false otherwise
function isPressed() {
    return pressed;
}

// Return true if button is currently interactable, false otherwise
function isInteractable() {
    return interactable;
}

// Called every frame while button is updating
function onUpdate(eventData) {
    if (pressed) {
        if (autoResetEnabled) {
            var curTime = getTime();
            if (curTime - (lastPressTime + getDeltaTime()) > .1) {
                pressUp();
                return;
            }
            lastPressTime = curTime;
        }
        press();
    }
}

// Checks every frame if touch position is off this Screen Transform's boundaries. If so, Press Up
function touchOffBoundsCheck(eventData) {
    if (!thisScreenTransform.containsScreenPoint(eventData.getTouchPosition())) {
        pressUp();
    }
}

// Press Down function
function pressDown() {
    if (!interactable || (initialTrigger && pressed)) {
        return;
    }
    pressed = true;
    initialTrigger = true;
    lastPressTime = getTime();

    invokeVisualTransition("pressed");
    invokeAnimation("pressed", script.animation);

    callbackTracker.invokeAllCallbacks("onPressDown");
    printDebug("Press Down Event!");
}

// Press Up function
function pressUp() {
    if (!interactable || (initialTrigger && !pressed)) {
        pressed = false;
        return;
    }
    pressed = false;
    initialTrigger = true;

    invokeVisualTransition("normal");
    invokeAnimation("normal", script.animation);
    
    callbackTracker.invokeAllCallbacks("onPressUp");
    printDebug("Press Up Event!");
}
// Called every frame while button is being pressed
function press() {
    if (!interactable) {
        return;
    }
    callbackTracker.invokeAllCallbacks("onPress");
    printDebug("Press Event!");
}

// Disable this button
function disableInteractable() {
    if (!interactable) {
        return;
    }
    interactable = false;

    invokeVisualTransition("disabled");
    invokeAnimation("disabled", script.animation);

    callbackTracker.invokeScriptedCallbacks("onDisableInteractable");
    printDebug("Disabled!");
}

// Enable this button
function enableInteractable() {
    if (interactable) {
        return;
    } 
    interactable = true;
    
    var newState = (pressed) ? "pressed" : "normal";
    invokeVisualTransition(newState);
    invokeAnimation(newState, script.animation);

    callbackTracker.invokeScriptedCallbacks("onEnableInteractable");
    printDebug("Enabled!");
}

// Change the type of animation
function changeAnimationType(newType) {
    switch (newType) {
        case "None":
            script.animation = 0;
            break;
        case "Bounce":
            script.animation = 1;
            break;
        case "Squish":
            script.animation = 2;
            break;
        case "Tween":
            script.animation = 3;
            break;
        case "OffsetPosition":
            script.animation = 4;
            script.transformType = "OffsetPosition";
            break;
        case "AnchorPosition":
            script.animation = 4;
            script.transformType = "AnchorPosition";
            break;
        case "Rotation":
            script.animation = 4;
            script.transformType = "Rotation";
            break;
        case "Scale":
            script.animation = 4;
            script.transformType = "Scale";
            break;
        default:
            printWarning("trying to change the animation type to an invalid animation!");
            break;
    }

    initAnimations();
}

// Change one of the state parameters of this Button to a new value
function changeStateValue(state, type, newValue) {
    if (!script[ state + type ]) {
        printWarning("trying to change an invalid Button state on the Script Component!");
        return;
    }
    script[ state + type ] = newValue;
    initAnimations(); 
}

// Get one of the state parameters of this Button
function getStateValue(state, type) {
    if (!script[ state + type ]) {
        printWarning("trying to get an invalid Button state!");
        return;
    }
    return script[ state + type ];
}

// Invoke animation 
function invokeAnimation(animationState, animationType) {
    switch (animationType) {
        case 1: // Bounce
        case 2: // Squish
        case 4: // Transform
            var endState = animations[animationState];
            if (endState === undefined) {
                print("ERROR: missing animation state: " + animationState);
            } else {
                transformAnimationHelper.startAnimation(endState);
            }
            break;
        case 3: // Custom (Tween)
            if (currentTween) {
                global.tweenManager.stopTween(script.sceneObjectWithTweens, currentTween);
            }

            var animationTween = script[animationState + "Tween"];
            if (animationTween) {
                global.tweenManager.startTween(script.sceneObjectWithTweens, animationTween);
            }

            currentTween = animationTween;
            break;
    }
}

// Get the current color of the Background
function getColor() {
    return backgroundImage.mainPass.baseColor;
}

// Get the current texture of the Background
function getTexture() {
    return backgroundImage.mainPass.baseTex;
}

function setTexture(texture) {
    if (texture) {
        backgroundImage.mainPass.baseTex = texture;
    }
}

// Invoke visual transition (Color and/or Texture Swap)
function invokeVisualTransition(transitionState) {
    // Setup color lerp over time
    
    var endState = script[transitionState + "Color"];
    transitionAnimationHelper.startAnimation(endState);

    // Setup immediate Texture Swap
    var transitionTexture = script[transitionState + "Texture"];
    setTexture(transitionTexture);
}

// Print debug messages
function printDebug(message) {
    if (script.printDebugStatements) {
        print("UIButton " + sceneObject.name+ " - " + message);
    }
}

// Print warning message
function printWarning(message) {
    if (script.printWarningStatements) {
        print("UIButton " + sceneObject.name + " - WARNING, " + message);
    }
}

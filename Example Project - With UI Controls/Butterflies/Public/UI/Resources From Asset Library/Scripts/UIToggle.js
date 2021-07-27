// UIToggle.js
// Version: 0.1.1
// Event: Initialized Event
// Description: Trigger events and behaviors by switching on and off.
//
// ----- USAGE -----
// Attach this script to a Scene Object with a Screen Transform Component.
// Assign a Screen Image Object to the "Background Object" parameter.
// Assign a Scene Object with a UIButton Script Component to the "Button Object" parameter 
//
// ----- LOCAL API USAGE -----
// Valid Event Types: "onEnableInteractable", "onDisableInteractable", "onToggle", "onToggleOn", "onToggleOff"
//
// Manually enable interactable
// script.api.enableInteractable()
//
// Manually disable interactable
// script.api.disableInteractable()
//
// Add callback function to event
// script.api.addCallback(eventType, callback)
//
// Remove callback function from event
// script.api.removeCallback(eventType, callback)
//
// True if interactable
// script.api.isInteractable()
//
// Enable touch events
// script.api.enableTouchEvents()
//
// Disable touch events
// script.api.disableTouchEvents()
//
// Returns true if toggle is in "On" state, false if toggle is in "Off" state
// script.api.getToggleValue()
//
// Manually switch off
// script.api.toggleOff()
//
// Manually switch on
// script.api.toggleOn()
//
// Manually switch to the opposite state
// script.api.toggle()
//
// -----------------

//@input bool interactable = true
//@input bool initialToggleValue = false {"label":"On By Default"}
//@ui {"widget":"separator"}

//@input bool editProperties = false
//@ui {"widget":"group_start", "label":"Properties", "showIf":"editProperties"}
//@input float startEndpoint = -0.8 {"widget":"slider", "min": -1.0, "max": 1.0, "step": 0.01, "label":"Start Anchor"}
//@input float endEndpoint = 0.8 {"widget":"slider", "min": -1.0, "max": 1.0, "step": 0.01, "label":"End Anchor"}
//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@input bool useColors = false 
//@ui {"widget":"group_start", "label":"Colors", "showIf":"useColors"}
//@input vec4 toggleOnColor = {1, 1, 1, 1} {"widget":"color"}
//@input vec4 toggleOffColor = {1, 1, 1, 1} {"widget":"color"}
//@input vec4 disabledColor = {1, 1, 1, 1} {"widget":"color"}
//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@input bool useTextures = false
//@ui {"widget":"group_start", "label":"Textures", "showIf":"useTextures"}
//@input Asset.Texture toggleOnTexture
//@input Asset.Texture toggleOffTexture
//@input Asset.Texture disabledTexture
//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@input bool editEventCallbacks = false
//@ui {"widget":"group_start", "label":"Event Callbacks", "showIf":"editEventCallbacks" }
//@input int callbackType = 0 {"widget":"combobox", "values":[{"label":"None", "value":0}, {"label":"Behavior Script", "value": 1}, {"label":"Behavior Custom Trigger", "value":2}, {"label":"Custom Function", "value":3}]}

//@input Component.ScriptComponent[] onToggleOffBehaviors {"label":"On Toggle Off Behaviors", "showIf":"callbackType", "showIfValue":1}
//@ui {"widget":"separator", "showIf":"callbackType", "showIfValue":1}
//@input Component.ScriptComponent[] onToggleOnBehaviors {"label":"On Toggle On Behaviors", "showIf":"callbackType", "showIfValue":1}
//@ui {"widget":"separator", "showIf":"callbackType", "showIfValue":1}
//@input Component.ScriptComponent[] onToggleBehaviors {"label":"On Toggle Behaviors", "showIf":"callbackType", "showIfValue":1}

//@input string[] onToggleOffGlobalBehaviors {"label":"On Toggle Off Custom Triggers", "showIf":"callbackType", "showIfValue":2}
//@ui {"widget":"separator", "showIf":"callbackType", "showIfValue":2}
//@input string[] onToggleOnGlobalBehaviors {"label":"On Toggle On Custom Triggers", "showIf":"callbackType", "showIfValue":2}
//@ui {"widget":"separator", "showIf":"callbackType", "showIfValue":2}
//@input string[] onToggleGlobalBehaviors {"label":"On Toggle Custom Triggers", "showIf":"callbackType", "showIfValue":2}

//@input Component.ScriptComponent customFunctionScript {"showIf":"callbackType", "showIfValue":3}
//@input string[] onToggleOffFunctionNames {"label":"On Toggle Off Functions", "showIf":"callbackType", "showIfValue":3}
//@ui {"widget":"separator", "showIf":"callbackType", "showIfValue":3}
//@input string[] onToggleOnFunctionNames {"label":"On Toggle On Functions", "showIf":"callbackType", "showIfValue":3}
//@ui {"widget":"separator", "showIf":"callbackType", "showIfValue":3}
//@input string[] onToggleFunctionNames {"label":"On Toggle Functions", "showIf":"callbackType", "showIfValue":3}
//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@input bool editAdvancedOptions = false
//@ui {"widget":"group_start", "label":"Advanced Options", "showIf":"editAdvancedOptions"}
//@input bool printDebugStatements = false
//@input bool printWarningStatements = true
//@input bool disableTouchEvents = false
//@input bool editConnections = false
//@ui {"widget":"group_start", "label":"Connections", "showIf":"editConnections"}
//@input SceneObject backgroundObject
//@input SceneObject buttonObject
//@ui {"widget":"group_end"}
//@input string toggleTouchEvent = "TouchStartEvent" {"widget":"combobox", "values":[{"label":"Touch Start", "value":"TouchStartEvent"}, {"label":"Touch End", "value":"TouchEndEvent"}]}
//@ui {"widget":"group_end"}

var callbackTracker = new global.CallbackTracker(script);

// Local API
script.api.toggleOff = toggleOff;
script.api.toggleOn = toggleOn;
script.api.toggle = toggle;
script.api.getToggleValue = getToggleValue;
script.api.enableInteractable = enableInteractable;
script.api.disableInteractable = disableInteractable;
script.api.isInteractable = isInteractable;
script.api.enableTouchEvents = enableTouchEvents;
script.api.disableTouchEvents = disableTouchEvents;
script.api.initialized = false;
script.api.widgetType = global.WidgetTypes.UIToggle;

script.api.addCallback = callbackTracker.addCallback.bind(callbackTracker);
script.api.removeCallback = callbackTracker.removeCallback.bind(callbackTracker);

script.api.ownerScript = null;

// Touch Event callbacks
script.api.onTouchStart = onTouchStart;
script.api.onTouchEnd = onTouchEnd;
script.api.onTouchMove = onTouchMove;

script.api.allowTouchEvents = !script.disableTouchEvents;

script.api.acceptChildWidget = acceptChildWidget;
script.api.setOwner = setOwner;
script.api.notifyOnInitialize = notifyOnInitialize;

script.api.claimTouchStart = claimTouchStart;
script.api.getMainRenderOrder = getMainRenderOrder;

// Is this widget interactable?
var interactable = script.interactable;

// Relevant Components
var buttonScript = null;
var backgroundScreenTransform = null;
var backgroundImage = null;

// Current toggle value
var toggleValue = script.initialToggleValue;

var sceneObject = script.getSceneObject();


var refreshHelper = new global.RefreshHelper(initParams);

function refresh() {
    refreshHelper.requestRefresh();
}
refresh();

function claimTouchStart(touchPosition) {
    return (backgroundScreenTransform && backgroundScreenTransform.containsScreenPoint(touchPosition))
        ? global.TouchClaimTypes.Claim
        : global.TouchClaimTypes.Reject;
}

function getMainRenderOrder() {
    return backgroundImage ? backgroundImage.getRenderOrder() : null;
}

function acceptChildWidget(widget) {
    var widgetApi = widget.api;
    if (!buttonScript && !widgetApi.ownerScript && widgetApi.widgetType == global.WidgetTypes.UIButton) {
        global.politeCall(widget, "setOwner", [script]);
        buttonScript = widget;
        updateWidgetInteractable(buttonScript);
        // Disable auto-reset on the button so it doesn't reset its pressed state
        widgetApi.setAutoResetEnabled(false);
        refresh();
        return true;
    }
    return false;
}

// Initialize all parameters
function initParams() {
    if (script.api.initialized) {
        return;
    }
    if (!initBackground() ||
		!initButton() ||
		!initInteractable()) {
        return;
    }

    global.answerPoliteCalls(script, "notifyOnInitialize");
    checkOwner();

    script.api.initialized = true;
    
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

function notifyOnInitialize(callback) {
    callback(script);
}

// Initialize Background parameters
function initBackground() {
    if (!script.backgroundObject) { 
        printWarning("no Reference to Background Scene Object! Attempting to search children...");
        script.backgroundObject = global.getChildByName(script.getSceneObject(), "Background");
        if (!script.backgroundObject) {
            printWarning("the Background Scene Object has not been assigned! Please go to \"Advanced Options\" and reassign it under \"Edit Connections\"!");
            return false;
        }
    }

    // Obtain Screen Transform Component from the target
    backgroundScreenTransform = script.backgroundObject.getComponent("Component.ScreenTransform");
    if (!backgroundScreenTransform) {
        printWarning("missing a Screen Transform Component!");
        return false;
    }

    // Obtain Image Component from the target
    backgroundImage = script.backgroundObject.getComponent("Component.Image");
    if (!backgroundImage) {
        printWarning("missing an Image Component!");
        return false;
    }

    // TODO: cleanup
    // backgroundImage.mainMaterial = backgroundImage.mainMaterial.clone();
    return true;
}

// Change Background Color/Texture based on toggle state
function changeBackgroundVisuals(toggleState) {
    if (script.useTextures && script[toggleState + "Texture"]) {
        backgroundImage.mainPass.baseTex = script[toggleState + "Texture"];
    }

    if (script.useColors) {
        backgroundImage.mainPass.baseColor = script[toggleState + "Color"];
    }
}

// Initialize Button parameters
function initButton() {
    // Obtain the Script Component of the Button that this Toggle controls
    if (!script.buttonObject) {
        printWarning("no Reference to Button Scene Object! Attempting to search children...");
        script.buttonObject = global.getChildByName(script.getSceneObject(), "Toggle Button");
        if (!script.buttonObject) {
            printWarning("the Button Scene Object has not been assigned! Please go to \"Advanced Options\" and reassign it under \"Edit Connections\"!");
            return false;
        }
    }

    if (!buttonScript) {
        global.findScript(script.buttonObject, null, function(scr) {
            global.politeCall(scr, "notifyOnInitialize", [acceptChildWidget]);
        });
    }

    if (!buttonScript) {
        return false;
    }

    initButtonAnimations();
    return true;
}

// Change Button animations based on this toggle's parameters
function initButtonAnimations() {
    var startPoint = new vec2(script.startEndpoint, 0.0);
    var endPoint = new vec2(script.endEndpoint, 0.0);

    buttonScript.api.changeAnimationType("AnchorPosition");
    buttonScript.api.changeStateValue("normal", "AnchorPosition", startPoint);
    buttonScript.api.changeStateValue("pressed", "AnchorPosition", endPoint);
    buttonScript.api.changeStateValue("disabled", "AnchorPosition", backgroundScreenTransform.anchors.getCenter());
}

// Initialize this Interactable
function initInteractable() {
    changeBackgroundVisuals((toggleValue) ? "toggleOn" : "toggleOff");
    // Disable if interactable is initially false
    if (!interactable) {
        updateWidgetInteractable(buttonScript);
    } else if (toggleValue) {
        buttonScript.api.pressDown();
    } else {
        buttonScript.api.pressUp();
    }
    return true;
}

// Disable touch event
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
    if (script.toggleTouchEvent == "TouchStartEvent") {
        toggle();
    }
    callbackTracker.invokeScriptedCallbacks("onTouchStart", eventData);
}

// Called On Touch End
function onTouchEnd(eventData) {
    if (!interactable) {
        return;
    }
    if (script.toggleTouchEvent == "TouchEndEvent") {
        toggle();
    }
    callbackTracker.invokeScriptedCallbacks("onTouchEnd", eventData);
}

// Called On Touch Move
function onTouchMove(eventData) {
    if (!interactable) {
        return;
    }
    callbackTracker.invokeScriptedCallbacks("onTouchMove", eventData);
}

// Return true if toggle is currently being pressed, false otherwise
function getToggleValue() {
    return toggleValue;
}

// Return true if toggle is currently interactable, false otherwise
function isInteractable() {
    return interactable;
}

// Toggle Off function
function toggleOff() {
    if (!interactable || toggleValue == false) {
        return;
    }
    toggleValue = false;

    callbackTracker.invokeAllCallbacks("onToggleOff");
    callbackTracker.invokeAllCallbacks("onToggle", toggleValue);

    changeBackgroundVisuals("toggleOff");

    buttonScript.api.pressUp();

    printDebug("Toggle Off Event!");
}

// Toggle On function
function toggleOn() {
    if (!interactable || toggleValue == true) {
        return;
    }
    toggleValue = true;

    callbackTracker.invokeAllCallbacks("onToggleOn");
    callbackTracker.invokeAllCallbacks("onToggle", toggleValue);

    changeBackgroundVisuals("toggleOn");

    buttonScript.api.pressDown();

    printDebug("Toggle On Event!");
}

// Toggle function
function toggle() {
    if (!interactable) {
        return;
    }

    if (!toggleValue) {
        script.api.toggleOn();
    } else {
        script.api.toggleOff();
    }
}

function updateWidgetInteractable(widget) {
    if (widget) {
        if (interactable) {
            widget.api.enableInteractable();
        } else {
            widget.api.disableInteractable();
        }
    }
}

// Disable this toggle
function disableInteractable() {
    if (!interactable) { 
        return; 
    }
    
    interactable = false;

    updateWidgetInteractable(buttonScript);
    changeBackgroundVisuals("disabled");

    callbackTracker.invokeScriptedCallbacks("onDisableInteractable");
    printDebug("Disabled!");
}

// Enable this toggle
function enableInteractable() {
    if (interactable) {
        return;
    }
    
    interactable = true;

    updateWidgetInteractable(buttonScript);
    changeBackgroundVisuals((toggleValue) ? "toggleOn" : "toggleOff");

    callbackTracker.invokeScriptedCallbacks("onEnableInteractable");

    printDebug("Enabled!");
}

// Print debug messages
function printDebug(message) {
    if (script.printDebugStatements) {
        print("UIToggle " + sceneObject.name + " - " + message);
    }
}

// Print warning message
function printWarning(message) {
    if (script.printWarningStatements) {
        print("UIToggle " + sceneObject.name + " - WARNING, " + message);
    }
}
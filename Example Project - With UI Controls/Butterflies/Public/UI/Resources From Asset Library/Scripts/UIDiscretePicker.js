// UIDiscretePicker.js
// Version: 0.1.1
// Event: Initialized Event
// Description: Choose one of n existing buttons by tapping or sliding
//
// ----- USAGE -----
// Attach this script to a Scene Object with a Screen Transform Component.
// Assign a Screen Image Object to the "Background Object" parameter.
// Assign a Screen Image Object parented to the "Background Object" to the "Palette Object" parameter.
// Create a needed amount of Scene Objects with a UIButton Script Component and make them children of Parent Scene Object 
//
// ----- LOCAL API USAGE -----
// Valid Event Types: "onEnableInteractable", "onDisableInteractable", "onColorChanged", "onSliderValueChanged"
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
// Get the index of current selected item
// script.api.getSelectionIndex()

// -----------------

//@input bool interactable = true

//@ui {"widget":"separator"}

//@input bool editProperties = false
//@ui {"widget":"group_start", "label":"Properties", "showIf":"editProperties"}
//@input int direction = 0 {"widget":"combobox", "values":[{"label":"Vertical", "value": 0}, {"label":"Horizontal", "value": 1}]}
//@input int initialSelection = 0 {"label":"Initial Selection"}
//@input bool useButtonWidgets

//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@input bool editEventCallbacks = false
//@ui {"widget":"group_start", "label":"Event Callbacks", "showIf":"editEventCallbacks"}
//@input int callbackType = 0 {"widget":"combobox", "values":[{"label":"None", "value":0}, {"label":"Behavior Script", "value": 1}, {"label":"Behavior Custom Trigger", "value":2}, {"label":"Custom Function", "value":3}]}

//@input Component.ScriptComponent[] onSelectionChangedBehaviors {"label":"On Selection Changed", "showIf":"callbackType", "showIfValue":1}

//@input string[] onSelectionChangedGlobalBehaviors {"label":"On Selection Changed", "showIf":"callbackType", "showIfValue":2}

//@input Component.ScriptComponent customFunctionScript {"showIf":"callbackType", "showIfValue":3}
//@input string[] onSelectionChangedFunctionNames {"label":"On Value Changed", "showIf":"callbackType", "showIfValue":3}
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
//@input SceneObject selectionObject

//@ui {"widget":"group_end"}
//@ui {"widget":"group_end"}

var callbackTracker = new global.CallbackTracker(script);

// Local API
script.api.enableInteractable = enableInteractable;
script.api.disableInteractable = disableInteractable;
script.api.isInteractable = isInteractable;
script.api.enableTouchEvents = enableTouchEvents;
script.api.disableTouchEvents = disableTouchEvents;
script.api.getCurrentSelection = getCurrentSelection;
script.api.setCurrentSelection = setCurrentSelection;
script.api.initialized = false;
script.api.widgetType = global.WidgetTypes.UIDiscretePicker;
script.api.acceptChildWidget = acceptChildWidget;

script.api.addCallback = callbackTracker.addCallback.bind(callbackTracker);
script.api.removeCallback = callbackTracker.removeCallback.bind(callbackTracker);

// Touch Event callbacks
script.api.onTouchStart = onTouchStart;
script.api.onTouchEnd = onTouchEnd;
script.api.onTouchMove = onTouchMove;

script.api.allowTouchEvents = !script.disableTouchEvents;

script.api.setOwner = setOwner;
script.api.notifyOnInitialize = notifyOnInitialize;

script.api.claimTouchStart = claimTouchStart;
script.api.getMainRenderOrder = getMainRenderOrder;
// Is this widget interactable?
var interactable = script.interactable;

// Discrete Picker properties
var stepValueX;
var stepValueY;

var minEndpointX;
var maxEndpointX;
var minEndpointY;
var maxEndpointY;

// Relevant Components
var thisScreenTransform = null;
var dragScreenTransform;
var backgroundScreenTransform = null;
var backgroundImage = null;
var buttonScripts = [];

// Discrete Picker properties

var cursorIsSlideable = false;
var currentSelection = -1;
var count;
var sceneObject = script.getSceneObject();

var refreshHelper = new global.RefreshHelper(initParams);

function refresh() {
    refreshHelper.requestRefresh();
}

refresh();

function claimTouchStart(touchPosition) {
    return (thisScreenTransform && thisScreenTransform.containsScreenPoint(touchPosition))
        ? global.TouchClaimTypes.Claim
        : global.TouchClaimTypes.Reject;
}

function getMainRenderOrder() {
    return backgroundImage ? backgroundImage.getRenderOrder() : null;
}

function acceptChildWidget(widget) {
    var api = widget.api;
    if (acceptButtonWidget(widget)) {
        return true;
    } else if (!widget.api.ownerScript && api.widgetType >= 0) {
        global.politeCall(widget, "setOwner", [script]);
        refresh();
        return true;
    }
    return false;
}

function notifyOnInitialize(callback) {
    callback(script);
}

// Initialize all parameters
function initParams() {
    if (script.api.initialized) {
        return;
    }
    if (!initDiscretePicker() ||
        !initBackground() ||
        !initDragObject() ||
        !initLayout() ||
        !initButtons() ||
        !setInitialSelection() ||
        !initInteractable()
    ) {
        printWarning("Not Initialized");
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

// Initialize Color Picker parameters
function initDiscretePicker() {
    thisScreenTransform = sceneObject.getComponent("Component.ScreenTransform");
    if (!thisScreenTransform) {
        printWarning("please assign a Screen Transform component to this Scene Object!");
        return false;
    }

    return true;
}

// Initialize Background parameters
function initBackground() {
    if (!script.backgroundObject) {
        printWarning("no Reference to Background Scene Object! Attempting to search children...");
        script.backgroundObject = global.getChildByName(sceneObject, "Background");
        if (!script.backgroundObject) {
            printWarning("the Background Scene Object has not been assigned! Please go to \"Advanced Options\" and reassign it under \"Edit Connections\"!");
            return false;
        }
    }

    // Obtain Screen Transform Component from the background
    backgroundScreenTransform = script.backgroundObject.getComponent("Component.ScreenTransform");
    if (!backgroundScreenTransform) {
        printWarning("missing a Screen Transform Component!");
        return false;
    }

    // Obtain Image Component from the background
    backgroundImage = script.backgroundObject.getComponent("Component.Image");
    if (!backgroundImage) {
        printWarning("missing an Image Component!");
        return false;
    }
    return true;
}

function acceptButtonWidget(widget) {
    var api = widget.api;
    if (!api.ownerScript && api.widgetType == global.WidgetTypes.UIButton) {

        global.politeCall(widget, "setOwner", [script]);
        var buttonScript = widget;
        buttonScripts.push(buttonScript);
        updateWidgetInteractable(buttonScript);
        refresh();
        return true;
    }
    return false;
}

function initDragObject() {
    //selection button 
    if (!script.selectionObject) {
        printWarning("no Reference to Selection Scene Object! Attempting to search children...");
        script.selectionObject = global.getChildByName(sceneObject, "Selection");
        if (!script.selectionObject) {
            printWarning("the Selection Scene Object has not been assigned! Please go to \"Advanced Options\" and reassign it under \"Edit Connections\"!");
            return false;
        }
    }
    dragScreenTransform = script.selectionObject.getComponent("Component.ScreenTransform");
    if (!dragScreenTransform) {
        printWarning("missing a Screen Transform Component!");
        return false;
    }
    return true;
}

function initLayout() {
    count = script.backgroundObject.getChildrenCount();

    var btnSize = new vec2(2.0, 2.0);

    btnSize.x = script.direction == 0 ? 2.0 : 2.0 / count;
    btnSize.y = script.direction == 0 ? 2.0 / count : 2.0;

    for (var i = 0; i < count; i++) {
        var so = script.backgroundObject.getChild(i);

        var anchors = so.getComponent("Component.ScreenTransform").anchors;

        anchors.setSize(btnSize);

        var btnLocalPos = vec2.zero();
        btnLocalPos.x = script.direction == 0 ? 0 : 2.0 * (i + 0.5) / count - 1.0;
        btnLocalPos.y = script.direction == 0 ? 2.0 * (i + 0.5) / count - 1.0 : 0;

        anchors.setCenter(btnLocalPos);
    }

    var halfSize = 1.0 / count;

    minEndpointX = script.direction == 0 ? 0.5 : halfSize / 2.0;
    maxEndpointX = script.direction == 0 ? 0.5 : 1.0 - halfSize / 2.0;

    minEndpointY = script.direction == 0 ? halfSize / 2.0 : 0.5;
    maxEndpointY = script.direction == 0 ? 1.0 - halfSize / 2.0 : 0.5;

    stepValueX = (maxEndpointX - minEndpointX) / (count - 1.0);
    stepValueY = (maxEndpointY - minEndpointY) / (count - 1.0);

    return true;
}

function initButtons() {
    if (!script.useButtonWidgets) {
        return true;
    }
    for (var i = 0; i < count; i++) {
        var so = script.backgroundObject.getChild(i);
        initButton(so);
    }
    if (buttonScripts.length == count) {
        return true;
    }
    return false;
}

// Initialize Button parameters
function initButton(buttonObject) {
    global.findScript(buttonObject, null, function(scr) {
        global.politeCall(scr, "notifyOnInitialize", [acceptButtonWidget]);
    });
}

// Initialize this interactable
function initInteractable() {
    updateValue(currentSelection);
    return true;
}

// Initialize Color Picker's initial location
function setInitialSelection() {
    updateValue(Math.min(Math.max(0, script.initialSelection), count - 1));
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
// Event callbacks

// Called On Touch Start
function onTouchStart(eventData) {
    if (!interactable) {
        return;
    }
    touchStartPicker(eventData);
    callbackTracker.invokeScriptedCallbacks("onTouchStart", eventData);
}

// Called On Touch End
function onTouchEnd(eventData) {
    if (!interactable) {
        return;
    }
    touchEndPicker(eventData);
    callbackTracker.invokeScriptedCallbacks("onTouchEnd", eventData);
}

// Called On Touch Move
function onTouchMove(eventData) {
    if (!interactable) {
        return;
    }
    touchMovePicker(eventData);
    callbackTracker.invokeScriptedCallbacks("onTouchMove", eventData);
}

// Apply appropriate action based on whatever was touched on the Color Picker

function touchStartPicker(eventData) {
    var touchPos = eventData.getTouchPosition();
    if (thisScreenTransform.containsScreenPoint(touchPos)) {

        updateSelectionFromTouch(touchPos, true);

        cursorIsSlideable = true;

        callbackTracker.invokeScriptedCallbacks("onSelectionChanged", eventData);
    }
}

function touchEndPicker(eventData) {
    updateSelectionFromTouch(eventData.getTouchPosition(), true);
    cursorIsSlideable = false;
}

// Apply appropriate action based on whatever was touched on the Color Picker
function touchMovePicker(eventData) {
    if (cursorIsSlideable) {
        updateSelectionFromTouch(eventData.getTouchPosition(), false);
    }
}

function updateSelectionFromTouch(touchPos) {
    var targetPos = thisScreenTransform.screenPointToLocalPoint(touchPos);
    var targetNormPos = targetPos.add(vec2.one()).uniformScale(0.5);
    targetNormPos.x = clamp(targetNormPos.x, minEndpointX, maxEndpointX);
    targetNormPos.y = clamp(targetNormPos.y, minEndpointY, maxEndpointY);

    var index = script.direction == 1 ? Math.floor(targetNormPos.x / stepValueX) : Math.floor(targetNormPos.y / stepValueY);

    updateValue(index);
}

function setLocalPointFromIndex(index) {
    var localScreenPos = vec2.zero();
    localScreenPos.x = script.direction ? minEndpointX + stepValueX * index : minEndpointX;
    localScreenPos.y = script.direction ? minEndpointY : minEndpointY + stepValueY * index;
    setLocationFromNormalizedPoint(localScreenPos);
}

function setLocationFromNormalizedPoint(localScreenPos) {
    var localPosX = localScreenPos.x * 2.0 - 1;
    var localPosY = localScreenPos.y * 2.0 - 1;
    dragScreenTransform.anchors.setCenter(new vec2(localPosX, localPosY));
}


function clamp(v, minV, maxV) {
    return Math.min(Math.max(v, minV), maxV);
}

// Update the color based on where the button is on the texture, and invoke callbacks
function updateValue(newSelection) {
    //update button effects if we use Button widgets
    if (script.useButtonWidgets) {
        updateButtonWidget(currentSelection, false);
    }

    currentSelection = newSelection;
    setLocalPointFromIndex(currentSelection);

    if (script.useButtonWidgets) {
        updateButtonWidget(currentSelection, true);
    }
    
    callbackTracker.invokeAllCallbacks("onSelectionChanged", currentSelection);
}

function updateButtonWidget(idx, isEnabled) {
    if (currentSelection > -1 && buttonScripts[currentSelection]) {
        if (isEnabled) {
            buttonScripts[idx].api.pressDown();
        } else {
            buttonScripts[idx].api.pressUp();
        }
    }
}

// Return currently picked location local to Palette
function getCurrentSelection() {
    return currentSelection;
}

function setCurrentSelection(newSelection) {
    updateValue(newSelection);

}

// Return true if Color Picker is currently interactable, false otherwise
function isInteractable() {
    return interactable;
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

// Disable this Picker
function disableInteractable() {
    if (!interactable) {
        return;
    }
    interactable = false;

    callbackTracker.invokeAllCallbacks("onDisableInteractable");

    printDebug("Disabled!");
}

// Enable this  Picker
function enableInteractable() {
    print("enable interactable");
    if (interactable) {
        return;
    }
    interactable = true;

    for (var b in buttonScripts) {
        updateWidgetInteractable(b);
    }
    updateValue(currentSelection);
    callbackTracker.invokeAllCallbacks("onEnableInteractable");

    printDebug("Enabled!");
}

// Print debug messages
function printDebug(message) {
    if (script.printDebugStatements) {
        print("UIDiscretePicker " + sceneObject.name + " - " + message);
    }
}

// Print warning message
function printWarning(message) {
    if (script.printWarningStatements) {
        print("UIDiscretePicker " + sceneObject.name + " - WARNING, " + message);
    }
}

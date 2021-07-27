// UIColorPicker.js
// Version: 0.1.2
// Event: Initialized Event
// Description: Choose a color from a color palette and apply it to a Mesh Visual
//
// ----- USAGE -----
// Attach this script to a Scene Object with a Screen Transform Component.
// Assign a Screen Image Object to the "Background Object" parameter.
// Assign a Screen Image Object parented to the "Background Object" to the "Palette Object" parameter.
// Assign a Scene Object with a UIButton Script Component and parented to the "Palette Object" to the "Button Object" parameter.
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
// Get the current color selected on this Color Picker
// script.api.getColor()
//
// Get the current value (0-1) of this Color Picker's slider
// script.api.getSliderValue()
//
// Manually set the value (0-1) of this Color Picker's slider
// script.api.setSliderValue(value)
// -----------------

//@input bool interactable = true
//@ui {"widget":"separator"}
//@input Component.MaterialMeshVisual colorRecipient
//@input string colorParameterName = "baseColor"
//@ui {"widget":"separator"}

//@input bool editProperties = false
//@ui {"widget":"group_start", "label":"Properties", "showIf":"editProperties"}
//@input float initialPosition = 0.5 {"widget":"slider", "min": 0.0, "max": 1.0, "step": 0.01, "label":"Initial Position"}

//@input int paletteType = 0 {"widget":"combobox", "values":[{"label":"Full Palette", "value": 0}, {"label":"2-Color Gradient", "value": 1}, {"label":"Slider", "value": 2}]}
//@ui {"widget":"group_start", "label":"Full Palette Properties", "showIf":"paletteType", "showIfValue": 0}
//@input float brightness = 1.0 {"widget":"slider", "min": 0.0, "max": 1.0, "step": 0.01, "label":"Saturation"}
//@input float saturation = 1.0 {"widget":"slider", "min": 0.0, "max": 1.0, "step": 0.01, "label":"Brightness"}
//@ui {"widget":"group_end"}

//@ui {"widget":"group_start", "label":"2-Color Properties", "showIf":"paletteType", "showIfValue": 1}
//@input vec4 colorStart = {1.0, 1.0, 1.0, 1.0} {"widget":"color"}
//@input vec4 colorEnd = {0.0, 0.0, 0.0, 1.0} {"widget":"color"}
//@ui {"widget":"group_end"}
//@ui {"widget":"group_start", "label":"Slider Properties", "showIf":"paletteType", "showIfValue": 2}
//@input vec4 fillColor = {1.0, 1.0, 1.0, 1.0} {"widget":"color"}
//@input vec4 emptyColor = {0.0, 0.0, 0.0, 0.0} {"widget":"color"}
//@ui {"widget":"group_end"}

//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@input bool editEventCallbacks = false
//@ui {"widget":"group_start", "label":"Event Callbacks", "showIf":"editEventCallbacks"}
//@input int callbackType = 0 {"widget":"combobox", "values":[{"label":"None", "value":0}, {"label":"Behavior Script", "value": 1}, {"label":"Behavior Custom Trigger", "value":2}, {"label":"Custom Function", "value":3}]}

//@input Component.ScriptComponent[] onColorChangedBehaviors {"label":"On Color Changed", "showIf":"callbackType", "showIfValue":1}
//@input Component.ScriptComponent[] onSliderValueChangedBehaviors {"label":"On Value Changed", "showIf":"callbackType", "showIfValue":1}

//@input string[] onColorChangedGlobalBehaviors {"label":"On Color Changed", "showIf":"callbackType", "showIfValue":2}
//@input string[] onSliderValueChangedGlobalBehaviors {"label":"On Value Changed", "showIf":"callbackType", "showIfValue":2}

//@input Component.ScriptComponent customFunctionScript {"showIf":"callbackType", "showIfValue":3}
//@input string[] onColorChangedFunctionNames {"label":"On Color Changed", "showIf":"callbackType", "showIfValue":3}
//@input string[] onSliderValueChangedFunctionNames {"label":"On Value Changed", "showIf":"callbackType", "showIfValue":3}
//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@input bool editAdvancedOptions = false
//@ui {"widget":"group_start", "label":"Advanced Options", "showIf":"editAdvancedOptions"}
//@input bool storeValue 
//@input string storeName {"showIf" : "storeValue"}
//@input bool printDebugStatements = false
//@input bool printWarningStatements = true
//@input bool disableTouchEvents = false
//@input bool editConnections = false
//@ui {"widget":"group_start", "label":"Connections", "showIf":"editConnections"}
//@input SceneObject backgroundObject
//@input SceneObject paletteObject
//@input SceneObject buttonObject
//@input SceneObject colorVisualObject
//@input SceneObject popupObject
//@ui {"widget":"group_end"}
//@ui {"widget":"group_end"}
var callbackTracker = new global.CallbackTracker(script);

// Local API
script.api.enableInteractable = enableInteractable;
script.api.disableInteractable = disableInteractable;
script.api.isInteractable = isInteractable;
script.api.enableTouchEvents = enableTouchEvents;
script.api.disableTouchEvents = disableTouchEvents;
script.api.getColor = getColor;
script.api.getSliderValue = getSliderValue;
script.api.setSliderValue = setSliderValue;
script.api.initialized = false;
script.api.widgetType = global.WidgetTypes.UIColorPicker;
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

// 2D Slider properties
var minValueX = 0.0;
var maxValueX = 1.0;
var stepValueX = 0.001;
var initialValueX = 0.5;

var minValueY = 0.0;
var maxValueY = 1.0;
var stepValueY = 0.001;
var initialValueY = script.initialPosition;

var minEndpointX = 0.5;
var maxEndpointX = 0.5;
var minEndpointY = 0.0;
var maxEndpointY = 1.0;


// Relevant Components
var paletteScreenTransform = null;
var paletteImage = null;
var thisScreenTransform = null;
var backgroundScreenTransform = null;
var backgroundImage = null;
var buttonScript = null;
var buttonScreenTransform = null;
var colorVisualImage = null;
var popupWidget = null;

// Color Picker properties
var sliderMaterial;
var currentColor = new vec4(0.0, 0.0, 0.0, 0.0);
var currentValue = 0;
var localScreenPos = new vec2(0.0, 0.0);
var cursorIsSlideable = false;

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
    var api = widget.api;
    if (acceptPopupWidget(widget)) {
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

    if (!initColorPicker() ||
        !initBackground() ||
        !initPalette() ||
        !initButton() ||
        !initColorVisual() ||
        !initLocalScreenPos() ||
        !initInteractable() ||
        !initPopup()
    ) {
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
function initColorPicker() {
    thisScreenTransform = sceneObject.getComponent("Component.ScreenTransform");
    if (!thisScreenTransform) {
        printWarning("please assign a Screen Transform component to this Scene Object!");
        return false;
    }

    return true;
}

// Initialize Palette parameters
function initPalette() {
    if (!script.paletteObject) {
        printWarning("no Reference to Palette Scene Object! Attempting to search children...");
        script.paletteObject = global.getChildByName(sceneObject, "Palette");
        if (!script.paletteObject) {
            printWarning("the Palette Scene Object has not been assigned! Please go to \"Advanced Options\" and reassign it under \"Edit Connections\"!");
            return false;
        }
    }

    // Obtain Screen Transform Component from the palette
    paletteScreenTransform = script.paletteObject.getComponent("Component.ScreenTransform");
    if (!paletteScreenTransform) {
        printWarning("missing a Screen Transform Component!");
        return false;
    }
    
    // Obtain Image Component from the palette
    paletteImage = script.paletteObject.getComponent("Component.Image");
    if (!paletteImage) {
        printWarning("missing an Image Component!");
        return false;
    }
    
    // Configure palette material
    if (!sliderMaterial) {
        sliderMaterial = paletteImage.mainMaterial.clone();
        paletteImage.mainMaterial = sliderMaterial;
        
        sliderMaterial.mainPass.paletteType = script.paletteType;
       
        
        switch (script.paletteType) {
            case (0):
                sliderMaterial.mainPass.saturation = script.saturation;
                sliderMaterial.mainPass.brightness = script.brightness;
                break;
            case (1):
                sliderMaterial.mainPass.colorStart = script.colorStart;
                sliderMaterial.mainPass.colorEnd = script.colorEnd;
                break;
            case (2):
                sliderMaterial.mainPass.colorStart = script.fillColor;
                sliderMaterial.mainPass.colorEnd = script.emptyColor;
                break;
        }
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
    if (!buttonScript && !api.ownerScript && api.widgetType == global.WidgetTypes.UIButton) {
        global.politeCall(widget, "setOwner", [script]);
        buttonScript = widget;
        updateWidgetInteractable(buttonScript);
        refresh();
        return true;
    }
    return false;
}

// Initialize Button parameters
function initButton() {
    // Obtain the Script Component of the Button that this Color Picker controls
    if (!script.buttonObject) {
        printWarning("no Reference to Button Scene Object! Attempting to search children...");
        script.buttonObject = global.getChildByName(sceneObject, "Cursor");
        if (!script.buttonObject) {
            printWarning("the Button Scene Object has not been assigned! Please go to \"Advanced Options\" and reassign it under \"Edit Connections\"!");
            return false;
        }
    }

    if (!buttonScript) {
        global.findScript(script.buttonObject, null, function(scr) {
            global.politeCall(scr, "notifyOnInitialize", [acceptButtonWidget]);
        });
    }

    if (!buttonScript) {
        return false;
    }

    // Obtain Screen Transform Component from button
    if (!buttonScreenTransform) {
        buttonScreenTransform = script.buttonObject.getComponent("Component.ScreenTransform");
        if (!buttonScreenTransform) {
            printWarning("assigned a Button Scene Object that is missing a Screen Transform Component!");
            return false;
        }
    }
    return true;
}

function acceptPopupWidget(widget) {
    var api = widget.api;
    if (!popupWidget && !api.ownerScript && api.widgetType == global.WidgetTypes.UIPopup) {
        global.politeCall(widget, "setOwner", [script]);
        popupWidget = widget;

        script.api.addCallback("onPaletteTouchStart", function() {
            popupWidget.api.scaleUp();
        });

        script.api.addCallback("onTouchEnd", function() {
            popupWidget.api.scaleDown();
        });

        script.api.addCallback("onColorChanged", function(newColor) {
            popupWidget.api.setColor(newColor);
            popupWidget.api.movePopup(buttonScreenTransform);
        });

        popupWidget.api.initPopupState(buttonScreenTransform);
        popupWidget.api.scaleDown(buttonScreenTransform);

        refresh();
        return true;
    }

    return false;
}


function initPopup() {
    // Obtain the Script Component of the Popup that this Color Picker controls
    if (!script.popupObject) {
        script.popupObject = global.getChildByName(sceneObject, "UI Popup");
    }

    if (!popupWidget && script.popupObject) {
        global.findScript(script.popupObject, null, function(scr) {
            global.politeCall(scr, "notifyOnInitialize", [acceptPopupWidget]);
        });
    }
    return true;
}

// Initialize Color Visual parameters
function initColorVisual() {
    if (!script.colorVisualObject) {
        printWarning("no Reference to Color Visual Scene Object! Attempting to search children...");
        script.colorVisualObject = global.getChildByName(sceneObject, "Color Visual");
        if (!script.colorVisualObject) {
            printWarning("the Color Visual Scene Object has not been assigned! If you would like the currently selected color to be displayed on an Image, please go to \"Advanced Options\" and reassign it under \"Edit Connections\"!");
            return true;
        }
    }

    // Obtain Color Visual Image Component
    if (!colorVisualImage) {
        colorVisualImage = script.colorVisualObject.getComponent("Component.Image");
        if (!colorVisualImage) {
            printWarning("assigned a Color Visual Scene Object that is missing an Image Component!");
            return false;
        }
    }

    return true;
}


// Initialize this interactable
function initInteractable() {
    updateWidgetInteractable(buttonScript);
    // Initialize the Color
    updateColor();
    return true;
}

// Initialize Color Picker's initial location
function initLocalScreenPos() {
    setLocationOnPalette(new vec2(initialValueX, initialValueY));
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
    var touchPos = eventData.getTouchPosition();
    if (backgroundScreenTransform.containsScreenPoint(touchPos)) {
        updatePickedLocationFromTouch(eventData);
        cursorIsSlideable = true;
        callbackTracker.invokeScriptedCallbacks("onPaletteTouchStart", eventData);
    }

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

// Apply appropriate action based on whatever was touched on the Color Picker
function touchEndPicker(eventData) {
    cursorIsSlideable = false;
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
function touchMovePicker(eventData) {
    if (cursorIsSlideable) {
        updatePickedLocationFromTouch(eventData);
    }
}

// Get current color
function getColor() {
    return new vec4(currentColor.r, currentColor.g, currentColor.b, currentColor.a);
}

function getSliderValue() {
    return currentValue;
}

// Update the color based on where the button is on the texture, and invoke callbacks
function updateColor() {
    if (localScreenPos != null) {
        currentValue = getLocationOnPalette();

        // Full Palette
        if (script.paletteType == 0) {
            var hsx = currentValue;
            var hue = hsx * 360.0;
            var saturation = 1.0;
            var value = 1.0;

            if (hsx < 10.0 / 260.0) {
                value = hsx / (10.0 / 260.0);
            } else {
                value = 1.0;
            }

            if (hsx > 250.0 / 260.0) {
                saturation = (hsx - 1.0) / (-10.0 / 260.0);
            }

            var RGBAColor = HSVAtoRGBA(new vec4(hue, saturation * script.brightness, value * script.saturation, 1.0));

            currentColor = RGBAColor;
        } else if (script.paletteType == 1) { // 2-Color Palette
            currentColor = vec4.lerp(script.colorEnd, script.colorStart, currentValue);
        }

        // Update any Color Visual targets with new color
        updateColorVisual();

        // Invoke callbacks
        callbackTracker.invokeAllCallbacks("onColorChanged", currentColor);
        callbackTracker.invokeAllCallbacks("onSliderValueChanged", currentValue);
    }
}

// Update palette touch position
function updatePickedLocationFromTouch(eventData) {
    // Convert Palette data in screen space
    var newButtonLocation = paletteScreenTransform.screenPointToLocalPoint(eventData.getTouchPosition());
    newButtonLocation = newButtonLocation.uniformScale(0.5).add(new vec2(.5, .5));

    var newStepValueX = stepValueX / (maxValueX - minValueX);
    var newStepValueY = stepValueY / (maxValueY - minValueY);

    // Apply step value
    newButtonLocation.x = Math.round(newButtonLocation.x / newStepValueX) * newStepValueX;
    newButtonLocation.y = Math.round(newButtonLocation.y / newStepValueY) * newStepValueY;

    setLocationOnPalette(newButtonLocation);
}

// Return currently picked location local to Palette
function getLocationOnPalette() {
    return localScreenPos.y;
}

// Set current location and automatically clamp to min and max
function setLocationOnPalette(proposedLocalScreenPos) {
    if (!interactable) {
        return;
    }

    // Clamp to the min and max local space values
    var proposedLocalScreenPosX = Math.min(Math.max(proposedLocalScreenPos.x, minEndpointX), maxEndpointX);
    var proposedLocalScreenPosY = Math.min(Math.max(proposedLocalScreenPos.y, minEndpointY), maxEndpointY);
    var clampedLocalScreenPos = new vec2(proposedLocalScreenPosX, proposedLocalScreenPosY);

    if (localScreenPos.distance(clampedLocalScreenPos) > 0.00000000000001) {
        // Update local screen position
        localScreenPos = clampedLocalScreenPos;
        updateButtonScreenAnchors();
        updateColor();
    }
}

function setSliderValue(value) {
    setLocationOnPalette(new vec2(localScreenPos.x, value));
}

// Update button anchors based on current location on palette
function updateButtonScreenAnchors() {
    if (buttonScreenTransform) {
        var currentLocation = new vec2(localScreenPos.x, localScreenPos.y);

        // Map the location to min and max endpoints
        currentLocation.x = 2.0 * currentLocation.x - 1.0;
        currentLocation.y = 2.0 * currentLocation.y - 1.0;

        var currentLocationScreen = paletteScreenTransform.localPointToScreenPoint(currentLocation);
        var buttonParentPoint = buttonScreenTransform.screenPointToParentPoint(currentLocationScreen);

        buttonScreenTransform.anchors.setCenter(buttonParentPoint);
    }
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

// Disable this Color Picker
function disableInteractable() {
    if (!interactable) {
        return;
    }
    interactable = false;

    updateWidgetInteractable(buttonScript);
    callbackTracker.invokeAllCallbacks("onDisableInteractable");

    printDebug("Disabled!");
}

// Enable this Color Picker
function enableInteractable() {
    if (interactable) {
        return;
    }
    interactable = true;

    updateWidgetInteractable(buttonScript);
    updateColor();
    callbackTracker.invokeAllCallbacks("onEnableInteractable");

    printDebug("Enabled!");
}

// Update color visuals based on the selected color
function updateColorVisual() {
    sliderMaterial.mainPass.value = currentValue;

    if (colorVisualImage) {
        colorVisualImage.mainPass.baseColor = currentColor;
    }

    if (script.colorRecipient) {
        script.colorRecipient.mainPass[script.colorParameterName] = currentColor;
    }
}

// Convert HSV to RGB color space
function HSVAtoRGBA(hsva) {
    var h = hsva.r;
    var s = hsva.g;
    var v = hsva.b;
    var a = hsva.a;
    var r, g, b;

    var hprime = h / 60;

    const c = v * s;
    const x = c * (1 - Math.abs((hprime % 2) - 1));
    const m = v - c;

    if (!hprime) {
        r = 0;
        g = 0;
        b = 0;
    }

    if (hprime >= 0 && hprime < 1) {
        r = c;
        g = x;
        b = 0;
    }

    if (hprime >= 1 && hprime < 2) {
        r = x;
        g = c;
        b = 0;
    }

    if (hprime >= 2 && hprime < 3) {
        r = 0;
        g = c;
        b = x;
    }

    if (hprime >= 3 && hprime < 4) {
        r = 0;
        g = x;
        b = c;
    }

    if (hprime >= 4 && hprime < 5) {
        r = x;
        g = 0;
        b = c;
    }

    if (hprime >= 5 && hprime <= 6) {
        r = c;
        g = 0;
        b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return new vec4(r / 255.0, g / 255.0, b / 255.0, a);
}

// Print debug messages
function printDebug(message) {
    if (script.printDebugStatements) {
        print("UIColorPicker " + sceneObject.name + " - " + message);
    }
}

// Print warning message
function printWarning(message) {
    if (script.printWarningStatements) {
        print("UIColorPicker " + sceneObject.name + " - WARNING, " + message);
    }
}

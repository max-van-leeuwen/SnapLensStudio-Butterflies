// UIPopup.js
// Version: 0.1.1
// Event: Initialized Event
// Description: Provides a "Popup" visual controllable by other scripts
//
// ----- USAGE -----
// Attach this as a child underneath a widget that uses it, like UIColorPicker
//
// ----- LOCAL API USAGE -----
//
// Initialize this Popup at screenTransform's position
// script.api.initPopupState(screenTransform)
//
// Set the color of this Popup's color visual
// script.api.setColor(color)
//
// Move this Popup to match screenTransform's position
// script.api.movePopup(screenTransform)
//
// Start the Popup's scale up animation
// script.api.scaleUp()
//
// Start the Popup's scale down animation
// script.api.scaleDown()
//
// -----------------

//@input string popupDirection = "right" {"widget":"combobox", "values":[{"label":"Right", "value":"right"}, {"label":"Left", "value":"left"}, {"label":"Bottom", "value":"bottom"}, {"label":"Top", "value":"top"}]}

//@ui {"widget":"separator"}
//@input bool editAdvancedOptions = false
//@ui {"widget":"group_start", "label":"Advanced Options", "showIf":"editAdvancedOptions"}
//@input bool printDebugStatements = false
//@input bool printWarningStatements = true
//@input bool editConnections = false
//@ui {"widget":"group_start", "label":"Connections", "showIf":"editConnections"}
//@input SceneObject popupIconObject
//@input Component.MaterialMeshVisual popupVisualTarget
//@ui {"widget":"group_end"}
//@ui {"widget":"group_end"}

// Relevant parameters
var thisScreenTransform = null;
var popupScreenTransform = null;
var popupImage = null;

// Stored animation states
var animationTime = .05;
var initialScale = null;

script.api.initialized = false;
script.api.setOwner = setOwner;
script.api.widgetType = global.WidgetTypes.UIPopup;
script.api.notifyOnInitialize = notifyOnInitialize;

script.api.initPopupState = initPopupState;
script.api.setColor = setColor;
script.api.movePopup = movePopup;
script.api.scaleUp = scaleUp;
script.api.scaleDown = scaleDown;

var sceneObject = script.getSceneObject();

var refreshHelper = new global.RefreshHelper(initParams);

const easeFunction = null;
var animationHelper = new global.AnimationHelper(script, animationTime, null, null, null, null);

function refresh() {
    refreshHelper.requestRefresh();
}

refresh();

function notifyOnInitialize(callback) {
    callback(script);
}

// Initialize all parameters
function initParams() {	
    if (script.api.initialized) {
        return;
    }
    if (!initPopup() || 
        !initPopupIcon() ||
		!initPopupTransforms() ||
		!initPopupVisualTarget()
    ) {
        printWarning("waiting limit reached. This widget has not been initialized!");
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
    if (script.api.ownerScript) {
        printWarning("owner has already been set!");
    }
    script.api.ownerScript = ownerScript;
    refresh();
}

function checkOwner() {
    if (!script.api.ownerScript) {
        seekOwner();
    }
    return !!script.api.ownerScript;
}

// Initialize this Popup parameters
function initPopup() {
    thisScreenTransform = sceneObject.getComponent("Component.ScreenTransform");
    if (!thisScreenTransform) {
        printWarning("no Screen Transform Component on this Scene Object!");
        return false;
    }
    initialScale = thisScreenTransform.scale;
    animationHelper.configureForScreenTransformSize(thisScreenTransform, easeFunction);
    return true;
}

// Initialize Popup Icon Object parameters
function initPopupIcon() {
    if (!script.popupIconObject) {
        printWarning("no Popup Icon Object assigned! Searching for Popup Icon Object in children...");
        script.popupIconObject = global.getChildByName(sceneObject, "Popup Icon");
        if (!script.popupIconObject) {
            printWarning("no Popup Icon Object found in children!");
            return false;
        }
    }

    popupScreenTransform = script.popupIconObject.getComponent("Component.ScreenTransform");
    if (!popupScreenTransform) {
        printWarning("Popup Scene Object is missing a Screen Transform Component!");
        return false;
    }

    popupImage = script.popupIconObject.getComponent("Component.Image");
    if (!popupImage) {
        printWarning("Popup Scene Object is missing an Image Component!");
        return false;
    }
	
    return true;
}

// Initialize popup transforms based on script parameters and tracked UI widget
function initPopupTransforms() {
    // Init Rotation
    var rotation = new vec3(0.0, 0.0, 0.0);
    switch (script.popupDirection) {
        case "left":
            rotation.z = 180.0;
            break;
        case "top":
            rotation.z = 90.0;
            break;
        case "bottom":
            rotation.z = 270.0;
            break;
    }
    rotation.z *= Math.PI / 180.0;
    thisScreenTransform.rotation = quat.fromEulerVec(rotation);
    
    return true;
}

function initPopupState(trackedUIScreenTransform) {
    movePopup(trackedUIScreenTransform);
}

// If no Visual Target is assigned, this script will take the first Mesh Visual Component it sees in this Popup's children
function initPopupVisualTarget() {
    if (!script.popupVisualTarget) {
        script.popupVisualTarget = getComponentInChildren("Component.MaterialMeshVisual", script.getSceneObject());
        if (!script.popupVisualTarget) {
            printWarning("no Popup Visual Targets found under children!");
        }
    }
    return true;
}

function getPopUpDirVec() {
    var dir = script.popupDirection;
    switch (dir) {
        case "right":
            return vec2.right();
        case "left":
            return vec2.left();
        case "bottom":
            return vec2.down();
        case "top":
            return vec2.up();
    }
}

function setColor(color) {
    if (script.popupVisualTarget) {
        script.popupVisualTarget.mainPass.baseColor = color;
    }
}

// Move the popup based on the reference Screen Transform's position
function movePopup(referenceScreenTransform) {
    if (!referenceScreenTransform) {
        return;
    }

    var dirVec = getPopUpDirVec();
    var referenceWorldPoint = referenceScreenTransform.localPointToWorldPoint(dirVec);

    // Convert to parent space
    var newParentCenter = thisScreenTransform.worldPointToParentPoint(referenceWorldPoint);

    thisScreenTransform.anchors.setCenter(newParentCenter);
}

// Scale the popup down
function scaleDown() {
    animationHelper.startAnimation(vec3.zero());
}

// Scale the popup up
function scaleUp() {
    animationHelper.startAnimation(initialScale);
}

// Print warning message
function printWarning(message) {
    if (script.printWarningStatements) {
        print("UIPopup " + sceneObject.name + " - WARNING, " + message);
    }
}

function getComponentInChildren(component, sceneObject, allowSelf) {
    if (sceneObject) {
        if (allowSelf) {
            var comp = sceneObject.getComponent(component);
            if (comp) {
                return comp;
            }
        }

        for (var i=0; i<sceneObject.getChildrenCount(); i++) {
            comp = getComponentInChildren(component, sceneObject.getChild(i), true);
            if (comp != null) {
                return comp;
            }
        }
    }

    return null;
}


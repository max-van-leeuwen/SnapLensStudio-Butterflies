// UIPanel.js
// Version: 0.1.1
// Event: Initialized Event
// Description: Panel that handles touch events for child UI widgets
//
// ----- USAGE -----
// Attach UI Widgets as direct children to UI Panel Scene Object.
// 
// ----- LOCAL API USAGE -----
// Valid Event Types: "onEnableInteractable", "onDisableInteractable"
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
// Enable touch events
// script.api.enableTouchEvents()
//
// Disable touch events
// script.api.disableTouchEvents()
//
// -----------------

//@input bool interactable = true

//@ui {"widget":"separator"}
//@input bool editAdvancedOptions
//@ui {"widget":"group_start", "label":"Advanced Options", "showIf":"editAdvancedOptions"}
//@input bool printDebugStatements = false
//@input bool printWarningStatements = true
//@input bool disableTouchEvents = false
//@ui {"widget":"group_end"}

if (!global.hasInitUIHelpers) {
    initGlobalHelpers();
}

var callbackTracker = new global.CallbackTracker(script);

// Local API
script.api.enableInteractable = enableInteractable;
script.api.disableInteractable = disableInteractable;
script.api.isInteractable = isInteractable;
script.api.enableTouchEvents = enableTouchEvents;
script.api.disableTouchEvents = disableTouchEvents;
script.api.initialized = false;
script.api.widgetType = global.WidgetTypes.UIPanel;
script.api.ownerScript = null;

script.api.addCallback = callbackTracker.addCallback.bind(callbackTracker);
script.api.removeCallback = callbackTracker.removeCallback.bind(callbackTracker);

// Touch Event callbacks
script.api.onTouchStart = onTouchStart;
script.api.onTouchEnd = onTouchEnd;
script.api.onTouchMove = onTouchMove;

script.api.allowTouchEvents = !script.disableTouchEvents;

script.api.acceptChildWidget = acceptChildWidget;
script.api.setOwner = setOwner;
script.api.notifyOnInitialize = notifyOnInitialize;

script.api.getMainRenderOrder = getMainRenderOrder;
script.api.claimTouchStart = claimTouchStart;

// Is this widget interactable?
var interactable = script.interactable;

// Stored touch events
var touchEvents = {};

// Relevant Components
var thisScreenTransform = null;
var thisImage = null;
var thisTouchComponent = null;

// Stores Objects containing information about each widget that this UIPanel controls
var childWidgets = {};
var activatedWidgets = [];

var childListIsDirty = false;
var sortedChildList = [];

var nextWidgetID = 0;

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
    return thisImage ? thisImage.getRenderOrder() : null;
}

function compareWidgetOrder(a, b) {
    if (a.renderOrder > b.renderOrder) {
        return -1;
    }
    if (a.renderOrder < b.renderOrder) {
        return 1;
    }
    return 0;
}

function getSortedChildList() {
    if (childListIsDirty) {
        sortedChildList.sort(compareWidgetOrder);
        childListIsDirty = false;
    }
    return sortedChildList;
}

function acceptChildWidget(scriptComponent) {
    var widgetType = scriptComponent.api.widgetType;
    if (!scriptComponent.api.owner && widgetType != null && widgetType >= 0) {
        global.politeCall(scriptComponent, "setOwner", [script]);

        // Store its properties and identify it by the next id
        var id = nextWidgetID++;

        var child = scriptComponent.getSceneObject();
        var renderOrder = scriptComponent.api.getMainRenderOrder ? scriptComponent.api.getMainRenderOrder() : null;

        var widgetInfo = {
            "sceneObject": child,
            "screenTransform": child.getFirstComponent("Component.ScreenTransform"),
            "scriptComponent": scriptComponent,
            "widgetType": widgetType,
            "renderOrder": renderOrder,
        };

        if (childWidgets[id] == null) {
            childWidgets[id] = widgetInfo;
        }

        sortedChildList.push(widgetInfo);
        childListIsDirty = true;

        // If a UI Panel, disable its touch events so that this UI Panel controls its touch events
        if (widgetType == global.WidgetTypes.UIPanel) {
            scriptComponent.api.disableTouchEvents();
        }

        if (!interactable) {
            scriptComponent.api.disableInteractable();
        }
        return true;
    }
}

// Initialize all parameters
function initParams() {
    if (script.api.initialized) {
        return;
    }

    if (!initPanel() ||
        !initInteractable() ||
        !initEvents()
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

function notifyOnInitialize(callback) {
    callback(script);
}

// Initialize Panel parameters
function initPanel() {
    thisScreenTransform = getOrAddComponent(sceneObject, "Component.ScreenTransform");

    // Obtain this Scene Object's Image Component
    thisImage = getOrAddComponent(sceneObject, "Component.Image");
    if (!thisImage) {
        printWarning("Missing an Image Component!");
        return false;
    }
    return true;
}

// Initialize this Interactable
function initInteractable() {
    return true;
}

// Initialize events and behaviors
function initEvents() {
    if (!script.disableTouchEvents) {
        createTouchEvents();
    }
    return true;
}

// Remove all Touch Events
function disableTouchEvents() {
    if (touchEvents.touchStart == null) {
        return;
    }

    touchEvents.targetScript.removeEvent(touchEvents.touchStart);
    touchEvents.touchStart.enabled = false;
    touchEvents.touchStart = null;

    touchEvents.targetScript.removeEvent(touchEvents.touchEnd);
    touchEvents.touchEnd.enabled = false;
    touchEvents.touchEnd = null;

    touchEvents.targetScript.removeEvent(touchEvents.touchMove);
    touchEvents.touchMove.enabled = false;
    touchEvents.touchMove = null;

    script.disableTouchEvents = true;
}

// Enable touch event
function enableTouchEvents() {
    if (touchEvents.touchStart != null) {
        return;
    }
    createTouchEvents();
    script.disableTouchEvents = false;
}

// Helper function to get or automatically create a Touch Component that uses this script's Image Component, and add TouchStart/End Events to it
function createTouchEvents() {
    if (!thisTouchComponent) {
        var targetObj = thisImage.getSceneObject();
        thisTouchComponent = getOrAddComponent(targetObj, "Component.TouchComponent");
        thisTouchComponent.addMeshVisual(thisImage);
        touchEvents.targetScript = targetObj.createComponent("Component.ScriptComponent");
    }

    touchEvents.touchStart = touchEvents.targetScript.createEvent("TouchStartEvent");
    touchEvents.touchStart.bind(onTouchStart);

    touchEvents.touchEnd = touchEvents.targetScript.createEvent("TouchEndEvent");
    touchEvents.touchEnd.bind(onTouchEnd);

    touchEvents.touchMove = touchEvents.targetScript.createEvent("TouchMoveEvent");
    touchEvents.touchMove.bind(onTouchMove);
}


// Called when Touch has started
function onTouchStart(eventData) {
    if (!interactable) {
        return;
    }
    invokeTouchStartEvents(eventData);
    callbackTracker.invokeScriptedCallbacks("onTouchStart", eventData);
}

// Invoke Touch Start events of UI widgets
function invokeTouchStartEvents(eventData) {
    var touchPos = eventData.getTouchPosition();

    var sortedChildren = getSortedChildList();

    for (var i = 0; i < sortedChildren.length; i++) {
        var childWidget = sortedChildren[i];
        var widgetApi = childWidget.scriptComponent.api;

        if (childWidget.sceneObject.enabled &&
            widgetApi.isInteractable() &&
            widgetApi.allowTouchEvents) {
            var claimType = widgetApi.claimTouchStart(touchPos);
            if (claimType == global.TouchClaimTypes.Reject) {
                continue;
            }
            activatedWidgets.push(childWidget);
            if (widgetApi.onTouchStart) {
                widgetApi.onTouchStart(eventData);
            }
            if (claimType == global.TouchClaimTypes.Claim) {
                return;
            }
        }
    }
}

// Called when Touch has ended
function onTouchEnd(eventData) {
    if (!interactable) {
        return;
    }
    invokeTouchEndEvents(eventData);
    callbackTracker.invokeScriptedCallbacks("onTouchEnd", eventData);
}

// Invoke Touch End events of UI widgets
function invokeTouchEndEvents(eventData) {
    // Invoke On Touch End event for all activated widgets
    for (var i = 0; i < activatedWidgets.length; i++) {
        var widget = activatedWidgets[i];
        if (!widget.sceneObject.enabled) {
            continue;
        }
        if (widget.scriptComponent.api.onTouchEnd) {
            widget.scriptComponent.api.onTouchEnd(eventData);
        }
    }

    activatedWidgets = [];
}

// Called when Touch has moved
function onTouchMove(eventData) {
    if (!interactable) {
        return;
    }
    invokeTouchMoveEvents(eventData);
    callbackTracker.invokeScriptedCallbacks("onTouchMove", eventData);
}

// Invoke Touch Move events of UI widgets
function invokeTouchMoveEvents(eventData) {
    // Invoke On Touch Move event for all activated widgets
    for (var i = 0; i < activatedWidgets.length; i++) {
        var widget = activatedWidgets[i];
        if (!widget.sceneObject.enabled) {
            continue;
        }
        if (widget.scriptComponent.api.onTouchMove) {
            widget.scriptComponent.api.onTouchMove(eventData);
        }
    }
}

// Return true if UI Panel is currently interactable, false otherwise
function isInteractable() {
    return interactable;
}

// Disable this UI Panel and all UI widgets that it controls
function disableInteractable() {
    if (!interactable) {
        return;
    }
    interactable = false;
    
    callbackTracker.invokeScriptedCallbacks("onDisableInteractable");

    for (var i in childWidgets) {
        var widget = childWidgets[i];
        widget.scriptComponent.api.disableInteractable();
    }
    printDebug("Disabled!");
}

// Enable this UI Panel and all UI widgets that it controls
function enableInteractable() {
    if (interactable) {
        return;
    }
    interactable = true;
    callbackTracker.invokeScriptedCallbacks("onEnableInteractable");

    for (var i in childWidgets) {
        var widget = childWidgets[i];
        widget.scriptComponent.api.enableInteractable();
    }
    printDebug("Enabled!");
}

// Print debug messages
function printDebug(message) {
    if (script.printDebugStatements) {
        print("UIPanel " + sceneObject.name + " - " + message);
    }
}

// Print warning message
function printWarning(message) {
    if (script.printWarningStatements) {
        print("UIPanel " + sceneObject.name + " - WARNING, " + message);
    }
}

function getOrAddComponent(obj, componentType) {
    return obj.getComponent(componentType) || obj.createComponent(componentType);
}

function initGlobalHelpers() {
    var WidgetTypes = {
        UIPanel: 0,
        UIButton: 1,
        UIToggle: 2,
        UIColorPicker: 3,
        UIPopup: 4,
        UIDiscretePicker : 5
    };

    function findScript(sceneObj, propName, filterFunc) {
        var count = sceneObj.getComponentCount("Component.ScriptComponent");
        for (var i = 0; i < count; i++) {
            var component = sceneObj.getComponentByIndex("Component.ScriptComponent", i);
            var scriptApi = component.api;
            if (propName && scriptApi[propName] === undefined) {
                continue;
            }
            if (filterFunc && !filterFunc(component)) {
                continue;
            }
            return component;
        }
        return null;
    }

    function findScriptUpwards(sceneObj, propName, filterFunc, allowSelf) {
        if (allowSelf) {
            var res = findScript(sceneObj, propName, filterFunc);
            if (res) {
                return res;
            }
        }
        if (sceneObj.hasParent()) {
            return findScriptUpwards(sceneObj.getParent(), propName, filterFunc, true);
        }
        return null;
    }

    function getChildByName(sceneObject, name) {
        if (sceneObject.name == name) {
            return sceneObject;
        }
        var count = sceneObject.getChildrenCount();
        for (var i = 0; i < count; i++) {
            var child = getChildByName(sceneObject.getChild(i), name);
            if (child != null) {
                return child;
            }
        }
        return null;
    }

    function getPendingCalls(scr, funcName) {
        var dic = setDefault(scr.api, "_pendingCalls", {});
        return setDefault(dic, funcName, []);
    }

    function politeCall(scr, funcName, args) {
        var api = scr.api;
        if (!api[funcName]) {
            getPendingCalls(scr, funcName).push(args);
        } else {
            api[funcName].apply(null, args);
        }
    }

    function answerPoliteCalls(scr, funcName, func) {
        var api = scr.api;
        func = func || api[funcName];
        var pending = getPendingCalls(scr, funcName);
        for (var i = 0; i < pending.length; i++) {
            func.apply(null, pending[i]);
        }
    }

    function CallbackTracker(scriptComponent) {
        this.scriptComponent = scriptComponent;
        this.callbackType = scriptComponent.callbackType;

        this.customCallbacks = [];
    }

    CallbackTracker.prototype = {
        addCallback: function(eventName, callback) {
            if (this.customCallbacks[eventName]) {
                this.customCallbacks[eventName].push(callback);
            } else {
                this.customCallbacks[eventName] = [callback];
            }
        },

        // Remove callback from event
        removeCallback: function(eventName, callback) {
            if (!this.customCallbacks[eventName]) {
                print(eventName + " Event does not exist!");
                return;
            }

            if (!removeFromArray(this.customCallbacks[eventName], callback)) {
                print("The callback does not exist!");
            }
        },

        invokeAllCallbacks: function(eventName, eventData) {
            this.invokeCallbacks(eventName, eventData);
            this.invokeScriptedCallbacks(eventName, eventData);
        },

        invokeScriptedCallbacks: function(eventName, eventData) {
            var callbacks = this.customCallbacks[eventName];
            if (callbacks) {
                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i](eventData);
                }
            }
        },

        invokeCallbacks: function(eventName, eventData) {
            // Invoke ui callbacks
            switch (this.callbackType) {
                case 1: // Behavior
                    var behaviors = this.scriptComponent[eventName + "Behaviors"];
                    if (!behaviors) {
                        print("WARNING: no event with name: " + eventName);
                        return;
                    }
                    for (var i = 0; i < behaviors.length; i++) {
                        if (behaviors[i] && behaviors[i].api.trigger) {
                            behaviors[i].api.trigger();
                        }
                    }
                    break;
                case 2: // Global Behavior
                    if (!global.behaviorSystem) {
                        print("The global behavior system has not been instantiated yet! Make sure a Behavior script is present somewhere!");
                        return;
                    }
                    var triggerNames = this.scriptComponent[eventName + "GlobalBehaviors"];
                    for (var j = 0; j < triggerNames.length; j++) {
                        if (triggerNames[j].length == 0) {
                            print("You are trying to send an empty string custom trigger!");
                            continue;
                        }
                        global.behaviorSystem.sendCustomTrigger(triggerNames[j]);
                    }
                    break;
                case 3: // Custom Functions
                    var otherScript = this.scriptComponent.customFunctionScript;
                    if (!otherScript) {
                        print("Does not have a Script Component with custom functions assigned, but you are trying to invoke custom callbacks!");
                        return;
                    }
                    var functionNames = this.scriptComponent[eventName + "FunctionNames"];
                    for (var k = 0; k < functionNames.length; k++) {
                        if (functionNames[k].length == 0) {
                            print("You are trying to invoke an empty string function!");
                            continue;
                        }
                        if (!otherScript.api[functionNames[k]]) {
                            print("Cannot find the " + functionNames[k] + " function in the assigned Script Component!");
                            continue;
                        }
                        otherScript.api[functionNames[k]](eventData);
                    }
                    break;
            }
        }
    };

    function RefreshHelper(refreshFunc) {
        this._refreshFunc = refreshFunc;
        this._needsRefresh = false;
        this._isRefreshing = false;
    }

    RefreshHelper.prototype = {
        requestRefresh: function() {
            if (this._isRefreshing) {
                this._needsRefresh = true;
                return;
            }
            this._isRefreshing = true;
            this._needsRefresh = false;
            this._refreshFunc();
            this._isRefreshing = false;
            if (this._needsRefresh) {
                this.requestRefresh();
            }
        }
    };


    var TouchClaimTypes = {
        Reject: 0,
        Share: 1,
        Claim: 2,
    };


    function AnimationHelper(scriptComponent, duration, getter, setter, lerpFunc, easing) {
        this.scriptComponent = scriptComponent;

        this.animationEvent = null;

        this.defaultDuration = duration;

        this.currentAnimationTime = 0;
        this.currentDuration = .05;
        this.completedFullAnimation = false;

        this.getterFunc = getter;
        this.setterFunc = setter;

        this.lerpFunc = lerpFunc;

        this.optionalEasing = easing;

        this.currentStartValue = 0;
        this.currentEndValue = 1;
    }

    AnimationHelper.prototype = {
        startAnimation: function(endValue, duration) {
            if (duration !== undefined) {
                this.currentDuration = duration;
            }

            // If the last animation was fully completed, reset the animation time to the script value
            if (this.completedFullAnimation) {
                this.resetAnimationTime();
                this.completedFullAnimation = false;
            }

            this.currentDuration = this.currentAnimationTime;
            this.currentAnimationTime = 0;

            this.currentStartValue = this.getterFunc
                ? this.getterFunc()
                : (1 - this.currentDuration);

            this.currentEndValue = endValue;

            // Setup the animation update event
            this.removeAnimationEvent();
            this.animationEvent = this.scriptComponent.createEvent("UpdateEvent");
            this.animationEvent.bind(this.update.bind(this));
        },

        resetAnimationTime: function() {
            this.currentAnimationTime = this.defaultDuration;
        },

        removeAnimationEvent: function() {
            if (this.animationEvent) {
                this.scriptComponent.removeEvent(this.animationEvent);
                this.animationEvent.enabled = false;
                this.animationEvent = null;
            }
        },

        getCurrentT: function() {
            return (this.currentDuration > 0) ? (this.currentAnimationTime / this.currentDuration) : 1.0;
        },

        setCurrentT: function(t) {
            this.currentAnimationTime = this.currentDuration * t;
        },

        easeTValue: function(t) {
            return (this.optionalEasing) ? this.optionalEasing(t) : t;
        },

        lerpTValue: function(t) {
            return (this.lerpFunc)
                ? this.lerpFunc(this.currentStartValue, this.currentEndValue, t)
                : this.currentStartValue + (this.currentEndValue - this.currentStartValue) * t;
        },

        applyTValue: function(t) {
            var easedValue = this.easeTValue(t);
            var lerpedValue = this.lerpTValue(easedValue);
            this.setterFunc(lerpedValue);
        },

        update: function(eventData) {
            this.currentAnimationTime += eventData.getDeltaTime();

            var t = this.getCurrentT();
            if (t >= 1.0) {
                this.completedFullAnimation = true;
                t = 1.0;
                this.setCurrentT(t);
                this.removeAnimationEvent();
            }

            this.applyTValue(t);
        },
    };

    // Helper functions to configure AnimationHelper
    AnimationHelper.prototype.configureForScreenTransformSize = function(screenTransform, optionalEasing) {
        this.getterFunc = makeSizeGetter(screenTransform);
        this.setterFunc = makeSizeSetter(screenTransform);
        this.lerpFunc = vec3Lerp;
        this.optionalEasing = optionalEasing;
    };

    AnimationHelper.prototype.configureForScreenTransformRotation = function(screenTransform, optionalEasing) {
        this.getterFunc = makeRotationGetter(screenTransform);
        this.setterFunc = makeRotationSetter(screenTransform);
        this.lerpFunc = floatLerp;
        this.optionalEasing = optionalEasing;
    };

    AnimationHelper.prototype.configureForScreenTransformAnchorPosition = function(screenTransform, optionalEasing) {
        this.getterFunc = makeRectCenterGetter(screenTransform.anchors);
        this.setterFunc = makeRectCenterSetter(screenTransform.anchors);
        this.lerpFunc = vec2Lerp;
        this.optionalEasing = optionalEasing;
    };

    AnimationHelper.prototype.configureForScreenTransformOffsetPosition = function(screenTransform, optionalEasing) {
        this.getterFunc = makeRectCenterGetter(screenTransform.offsets);
        this.setterFunc = makeRectCenterSetter(screenTransform.offsets);
        this.lerpFunc = vec2Lerp;
        this.optionalEasing = optionalEasing;
    };

    AnimationHelper.prototype.configureForMeshVisualColor = function(visual, optionalEasing) {
        this.getterFunc = makeMultiGetter(makeColorGetter, visual);
        this.setterFunc = makeMultiSetter(makeColorSetter, visual);
        this.lerpFunc = vec4Lerp;
        this.optionalEasing = optionalEasing;
    };

    // Helper function to return LERP'ed value
    function floatLerp(a, b, t) {
        return a + t * (b - a);
    }

    function vec2Lerp(a, b, t) {
        return vec2.lerp(a, b, t);
    }

    function vec3Lerp(a, b, t) {
        return vec3.lerp(a, b, t);
    }

    function vec4Lerp(a, b, t) {
        return vec4.lerp(a, b, t);
    }

    // Getter / Setter generators 
    function makeRectCenterGetter(rect) {
        return function() {
            return rect.getCenter();
        };
    }

    function makeRectCenterSetter(rect) {
        return function(v) {
            rect.setCenter(v);
        };
    }

    function makeSizeGetter(screenTransform) {
        return function() {
            return screenTransform.scale;
        };
    }

    function makeSizeSetter(screenTransform) {
        return function(v) {
            screenTransform.scale = v;
        };
    }

    const DEG_TO_RAD = 0.0174533;
    var RAD_TO_DEG = 57.2958;

    function makeRotationGetter(screenTransform) {
        return function() {
            return screenTransform.rotation.toEulerAngles().z * RAD_TO_DEG;
        };
    }

    function makeRotationSetter(screenTransform) {
        return function(v) {
            screenTransform.rotation = quat.fromEulerAngles(0.0, 0.0, v * DEG_TO_RAD);
        };
    }

    function makeColorGetter(visual) {
        return function() {
            return visual.mainPass.baseColor;
        };
    }

    function makeColorSetter(visual) {
        return function(v) {
            visual.mainPass.baseColor = v;
        };
    }

    function makeMultiGetter(getterMaker, args) {
        return getterMaker(Array.isArray(args) ? args[0] : args);
    }

    function makeMultiSetter(setterMaker, args) {
        if (!Array.isArray(args)) {
            return setterMaker(args);
        }
        if (args.length == 1) {
            return setterMaker(args[0]);
        }
        var setters = args.map(setterMaker);
        return function(v) {
            for (var i = 0; i < setters.length; i++) {
                setters[i](v);
            }
        };
    }

    // Easing Helpers
    function easeOutBack(t) {
        const s = 1.70158;
        return (t = t - 1) * t * ((s + 1) * t + s) + 1;
    }


    // Global API
    global.hasInitUIHelpers = true;

    global.findScript = findScript;
    global.findScriptUpwards = findScriptUpwards;
    global.getChildByName = getChildByName;

    global.politeCall = politeCall;
    global.answerPoliteCalls = answerPoliteCalls;
    global.WidgetTypes = WidgetTypes;

    global.CallbackTracker = CallbackTracker;
    global.RefreshHelper = RefreshHelper;
    global.AnimationHelper = AnimationHelper;

    global.TouchClaimTypes = TouchClaimTypes;

    global.EasingHelpers = {
        easeOutBack: easeOutBack,
    };


    function setDefault(obj, key, def) {
        var hasKey = Object.prototype.hasOwnProperty.call(obj, key);
        if (!hasKey) {
            obj[key] = def;
            return def;
        }
        return obj[key];
    }

    function removeFromArray(array, element) {
        var index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
            return true;
        }
        return false;
    }
}
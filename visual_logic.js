/* eslint-disable */

/**
 * Generated by Verge3D Puzzles v.4.4.0
 * Mon, 16 Oct 2023 05:03:55 GMT
 * Prefer not editing this file as your changes may get overridden once Puzzles are saved.
 * Check out https://www.soft8soft.com/docs/manual/en/introduction/Using-JavaScript.html
 * for the information on how to add your own JavaScript to Verge3D apps.
 */
function createPL(v3d = window.v3d) {

// global variables/constants used by puzzles' functions

var LIST_NONE = '<none>';

var _pGlob = {};

_pGlob.objCache = {};
_pGlob.fadeAnnotations = true;
_pGlob.pickedObject = '';
_pGlob.hoveredObject = '';
_pGlob.mediaElements = {};
_pGlob.loadedFile = '';
_pGlob.states = [];
_pGlob.percentage = 0;
_pGlob.openedFile = '';
_pGlob.openedFileMeta = {};
_pGlob.xrSessionAcquired = false;
_pGlob.xrSessionCallbacks = [];
_pGlob.screenCoords = new v3d.Vector2();
_pGlob.intervalTimers = {};
_pGlob.customEvents = new v3d.EventDispatcher();
_pGlob.eventListeners = [];

_pGlob.AXIS_X = new v3d.Vector3(1, 0, 0);
_pGlob.AXIS_Y = new v3d.Vector3(0, 1, 0);
_pGlob.AXIS_Z = new v3d.Vector3(0, 0, 1);
_pGlob.MIN_DRAG_SCALE = 10e-4;
_pGlob.SET_OBJ_ROT_EPS = 1e-8;

_pGlob.vec2Tmp = new v3d.Vector2();
_pGlob.vec2Tmp2 = new v3d.Vector2();
_pGlob.vec3Tmp = new v3d.Vector3();
_pGlob.vec3Tmp2 = new v3d.Vector3();
_pGlob.vec3Tmp3 = new v3d.Vector3();
_pGlob.vec3Tmp4 = new v3d.Vector3();
_pGlob.eulerTmp = new v3d.Euler();
_pGlob.eulerTmp2 = new v3d.Euler();
_pGlob.quatTmp = new v3d.Quaternion();
_pGlob.quatTmp2 = new v3d.Quaternion();
_pGlob.colorTmp = new v3d.Color();
_pGlob.mat4Tmp = new v3d.Matrix4();
_pGlob.planeTmp = new v3d.Plane();
_pGlob.raycasterTmp = new v3d.Raycaster(); // always check visibility

var PL = {};
// backward compatibility
if (v3d[Symbol.toStringTag] !== 'Module') {
    v3d.PL = v3d.puzzles = PL;
}

PL.procedures = PL.procedures || {};




PL.execInitPuzzles = function(options) {
    // always null, should not be available in "init" puzzles
    var appInstance = null;
    // app is more conventional than appInstance (used in exec script and app templates)
    var app = null;

    var _initGlob = {};
    _initGlob.percentage = 0;
    _initGlob.output = {
        initOptions: {
            fadeAnnotations: true,
            useBkgTransp: false,
            preserveDrawBuf: false,
            useCompAssets: false,
            useFullscreen: true,
            useCustomPreloader: false,
            preloaderStartCb: function() {},
            preloaderProgressCb: function() {},
            preloaderEndCb: function() {},
        }
    }

    // provide the container's id to puzzles that need access to the container
    _initGlob.container = options !== undefined && 'container' in options
            ? options.container : "";

    

    
    return _initGlob.output;
}

PL.init = function(appInstance, initOptions) {

// app is more conventional than appInstance (used in exec script and app templates)
var app = appInstance;

initOptions = initOptions || {};

if ('fadeAnnotations' in initOptions) {
    _pGlob.fadeAnnotations = initOptions.fadeAnnotations;
}



var pause;

// utility function envoked by almost all V3D-specific puzzles
// filter off some non-mesh types
function notIgnoredObj(obj) {
    return obj.type !== 'AmbientLight' &&
           obj.name !== '' &&
           !(obj.isMesh && obj.isMaterialGeneratedMesh) &&
           !obj.isAuxClippingMesh;
}


// utility function envoked by almost all V3D-specific puzzles
// find first occurence of the object by its name
function getObjectByName(objName) {
    var objFound;
    var runTime = _pGlob !== undefined;
    objFound = runTime ? _pGlob.objCache[objName] : null;

    if (objFound && objFound.name === objName)
        return objFound;

    if (appInstance.scene) {
        appInstance.scene.traverse(function(obj) {
            if (!objFound && notIgnoredObj(obj) && (obj.name == objName)) {
                objFound = obj;
                if (runTime) {
                    _pGlob.objCache[objName] = objFound;
                }
            }
        });
    }
    return objFound;
}


// utility function envoked by almost all V3D-specific puzzles
// retrieve all objects on the scene
function getAllObjectNames() {
    var objNameList = [];
    appInstance.scene.traverse(function(obj) {
        if (notIgnoredObj(obj))
            objNameList.push(obj.name)
    });
    return objNameList;
}


// utility function envoked by almost all V3D-specific puzzles
// retrieve all objects which belong to the group
function getObjectNamesByGroupName(targetGroupName) {
    var objNameList = [];
    appInstance.scene.traverse(function(obj){
        if (notIgnoredObj(obj)) {
            var groupNames = obj.groupNames;
            if (!groupNames)
                return;
            for (var i = 0; i < groupNames.length; i++) {
                var groupName = groupNames[i];
                if (groupName == targetGroupName) {
                    objNameList.push(obj.name);
                }
            }
        }
    });
    return objNameList;
}


// utility function envoked by almost all V3D-specific puzzles
// process object input, which can be either single obj or array of objects, or a group
function retrieveObjectNames(objNames) {
    var acc = [];
    retrieveObjectNamesAcc(objNames, acc);
    return acc.filter(function(name) {
        return name;
    });
}

function retrieveObjectNamesAcc(currObjNames, acc) {
    if (typeof currObjNames == "string") {
        acc.push(currObjNames);
    } else if (Array.isArray(currObjNames) && currObjNames[0] == "GROUP") {
        var newObj = getObjectNamesByGroupName(currObjNames[1]);
        for (var i = 0; i < newObj.length; i++)
            acc.push(newObj[i]);
    } else if (Array.isArray(currObjNames) && currObjNames[0] == "ALL_OBJECTS") {
        var newObj = getAllObjectNames();
        for (var i = 0; i < newObj.length; i++)
            acc.push(newObj[i]);
    } else if (Array.isArray(currObjNames)) {
        for (var i = 0; i < currObjNames.length; i++)
            retrieveObjectNamesAcc(currObjNames[i], acc);
    }
}

// show and hide puzzles
function changeVis(objSelector, bool) {
    var objNames = retrieveObjectNames(objSelector);

    for (var i = 0; i < objNames.length; i++) {
        var objName = objNames[i]
        if (!objName)
            continue;
        var obj = getObjectByName(objName);
        if (!obj)
            continue;
        obj.visible = bool;
        obj.resolveMultiMaterial().forEach(function(objR) {
            objR.visible = bool;
        });
    }
}

function _checkListenersSame(target0, type0, listener0, optionsOrUseCapture0,
        target1, type1, listener1, optionsOrUseCapture1) {
    const capture0 = Boolean(optionsOrUseCapture0 instanceof Object
            ? optionsOrUseCapture0.capture : optionsOrUseCapture0);
    const capture1 = Boolean(optionsOrUseCapture1 instanceof Object
            ? optionsOrUseCapture1.capture : optionsOrUseCapture1);
    return target0 === target1 && type0 === type1 && listener0 === listener1
            && capture0 === capture1;
}

/**
 * Add the specified event listener to the specified target. This function also
 * stores listener data for easier disposing.
 */
function bindListener(target, type, listener, optionsOrUseCapture) {
    const alreadyExists = _pGlob.eventListeners.some(elem => {
        return _checkListenersSame(elem.target, elem.type, elem.listener,
                elem.optionsOrUseCapture, target, type, listener,
                optionsOrUseCapture);
    });

    if (!alreadyExists) {
        target.addEventListener(type, listener, optionsOrUseCapture);
        _pGlob.eventListeners.push({ target, type, listener, optionsOrUseCapture });
    }
}

// utility function used by the whenClicked, whenHovered and whenDraggedOver puzzles
function initObjectPicking(callback, eventType, mouseDownUseTouchStart, mouseButtons) {

    var elem = appInstance.renderer.domElement;
    bindListener(elem, eventType, pickListener);

    if (eventType == 'mousedown') {

        var touchEventName = mouseDownUseTouchStart ? 'touchstart' : 'touchend';
        bindListener(elem, touchEventName, pickListener);

    } else if (eventType == 'dblclick') {

        var prevTapTime = 0;

        function doubleTapCallback(event) {

            var now = new Date().getTime();
            var timesince = now - prevTapTime;

            if (timesince < 600 && timesince > 0) {

                pickListener(event);
                prevTapTime = 0;
                return;

            }

            prevTapTime = new Date().getTime();
        }

        var touchEventName = mouseDownUseTouchStart ? 'touchstart' : 'touchend';
        bindListener(elem, touchEventName, doubleTapCallback);
    }

    var raycaster = new v3d.Raycaster();

    function pickListener(event) {

        // to handle unload in loadScene puzzle
        if (!appInstance.getCamera())
            return;

        event.preventDefault();

        var xNorm = 0, yNorm = 0;
        if (event instanceof MouseEvent) {
            if (mouseButtons && mouseButtons.indexOf(event.button) == -1)
                return;
            xNorm = event.offsetX / elem.clientWidth;
            yNorm = event.offsetY / elem.clientHeight;
        } else if (event instanceof TouchEvent) {
            var rect = elem.getBoundingClientRect();
            xNorm = (event.changedTouches[0].clientX - rect.left) / rect.width;
            yNorm = (event.changedTouches[0].clientY - rect.top) / rect.height;
        }

        _pGlob.screenCoords.x = xNorm * 2 - 1;
        _pGlob.screenCoords.y = -yNorm * 2 + 1;
        raycaster.setFromCamera(_pGlob.screenCoords, appInstance.getCamera(true));
        var objList = [];
        appInstance.scene.traverse(function(obj){objList.push(obj);});
        var intersects = raycaster.intersectObjects(objList, false);
        callback(intersects, event);
    }
}

function objectsIncludeObj(objNames, testedObjName) {
    if (!testedObjName) return false;

    for (var i = 0; i < objNames.length; i++) {
        if (testedObjName == objNames[i]) {
            return true;
        } else {
            // also check children which are auto-generated for multi-material objects
            var obj = getObjectByName(objNames[i]);
            if (obj && obj.type == "Group") {
                for (var j = 0; j < obj.children.length; j++) {
                    if (testedObjName == obj.children[j].name) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

// utility function used by the whenClicked, whenHovered, whenDraggedOver, and raycast puzzles
function getPickedObjectName(obj) {
    // auto-generated from a multi-material object, use parent name instead
    if (obj.isMesh && obj.isMaterialGeneratedMesh && obj.parent) {
        return obj.parent.name;
    } else {
        return obj.name;
    }
}

// whenClicked puzzle
function registerOnClick(objSelector, xRay, doubleClick, mouseButtons, cbDo, cbIfMissedDo) {

    // for AR/VR
    _pGlob.objClickInfo = _pGlob.objClickInfo || [];

    _pGlob.objClickInfo.push({
        objSelector: objSelector,
        callbacks: [cbDo, cbIfMissedDo]
    });

    initObjectPicking(function(intersects, event) {

        var isPicked = false;

        var maxIntersects = xRay ? intersects.length : Math.min(1, intersects.length);

        for (var i = 0; i < maxIntersects; i++) {
            var obj = intersects[i].object;
            var objName = getPickedObjectName(obj);
            var objNames = retrieveObjectNames(objSelector);

            if (objectsIncludeObj(objNames, objName)) {
                // save the object for the pickedObject block
                _pGlob.pickedObject = objName;
                isPicked = true;
                cbDo(event);
            }
        }

        if (!isPicked) {
            _pGlob.pickedObject = '';
            cbIfMissedDo(event);
        }

    }, doubleClick ? 'dblclick' : 'mousedown', false, mouseButtons);
}

// setMaterialWireframe puzzle
function setMaterialWireframe(matName, doWhat) {

    var matNames = Array.isArray(matName) ? matName : [matName];
    var mats = [];

    matNames.forEach(function(name) {
        mats = mats.concat(v3d.SceneUtils.getMaterialsByName(appInstance, name));
    });

    for (var i = 0; i < mats.length; i++) {
        var mat = mats[i];
        mat.wireframe = doWhat == 'ENABLE' ? true : false;
    }
}

// zoomCamera puzzle
function zoomCamera(objSelector, duration, doSlot) {

    duration = Math.max(0, duration);

    const objNames = retrieveObjectNames(objSelector);

    const zoomObjects = [];
    objNames.forEach(function(name) {
        const obj = getObjectByName(name);
        if (obj) {
            zoomObjects.push(obj);
        }
    });

    if (!zoomObjects.length) {
        return;
    }

    const camera = appInstance.getCamera();

    const zoom = [camera.zoom]; // for orthographic camera only

    const pos = _pGlob.vec3Tmp, target = _pGlob.vec3Tmp2;
    v3d.CameraUtils.calcCameraZoomToObjectsParams(camera, zoomObjects,
            pos, target, zoom);

    if (appInstance.controls && appInstance.controls.tween) {
        // orbit and flying cameras
        if (!appInstance.controls.inTween) {
            if (camera.isOrthographicCamera) {
                appInstance.controls.tweenZoomTo(target, zoom[0],
                        duration, doSlot);
            } else {
                appInstance.controls.tween(pos, target, duration, doSlot);
            }
        }
    } else {
        // TODO: static camera, just position it for now
        if (camera.parent) {
            camera.parent.worldToLocal(pos);
        }
        camera.position.copy(pos);
        camera.lookAt(target);
        camera.zoom = zoom[0];
        camera.updateProjectionMatrix();
        doSlot();
    }
}

// assignMaterial puzzle
function assignMat(objSelector, matName) {
    var objNames = retrieveObjectNames(objSelector);
    if (!matName)
        return;
    var mat = v3d.SceneUtils.getMaterialByName(appInstance, matName);
    if (!mat)
        return;
    for (var i = 0; i < objNames.length; i++) {
        var objName = objNames[i];
        if (!objName)
            continue;
        var obj = getObjectByName(objName);
        if (obj) {
            var firstSubmesh = obj.resolveMultiMaterial()[0];
            firstSubmesh.material = mat;
        }
    }
}

// outline puzzle
function outline(objSelector, doWhat) {
    var objNames = retrieveObjectNames(objSelector);

    if (!appInstance.postprocessing || !appInstance.postprocessing.outlinePass)
        return;
    var outlineArray = appInstance.postprocessing.outlinePass.selectedObjects;
    for (var i = 0; i < objNames.length; i++) {
        var objName = objNames[i];
        var obj = getObjectByName(objName);
        if (!obj)
            continue;
        if (doWhat == "ENABLE") {
            if (outlineArray.indexOf(obj) == -1)
                outlineArray.push(obj);
        } else {
            var index = outlineArray.indexOf(obj);
            if (index > -1)
                outlineArray.splice(index, 1);
        }
    }
}

/**
 * Get a scene that contains the root of the given action.
 */
function getSceneByAction(action) {
    var root = action.getRoot();
    var scene = root.type == "Scene" ? root : null;
    root.traverseAncestors(function(ancObj) {
        if (ancObj.type == "Scene") {
            scene = ancObj;
        }
    });
    return scene;
}

/**
 * Get the current scene's framerate.
 */
function getSceneAnimFrameRate(scene) {
    if (scene && 'animFrameRate' in scene.userData) {
        return scene.userData.animFrameRate;
    }
    return 24;
}

_pGlob.animMixerCallbacks = [];

var initAnimationMixer = function() {

    function onMixerFinished(e) {
        var cb = _pGlob.animMixerCallbacks;
        var found = [];
        for (var i = 0; i < cb.length; i++) {
            if (cb[i][0] == e.action) {
                cb[i][0] = null; // desactivate
                found.push(cb[i][1]);
            }
        }
        for (var i = 0; i < found.length; i++) {
            found[i]();
        }
    }

    return function initAnimationMixer() {
        if (appInstance.mixer && !appInstance.mixer.hasEventListener('finished', onMixerFinished)) {
            bindListener(appInstance.mixer, 'finished', onMixerFinished);
        }
    };

}();

// animation puzzles
function operateAnimation(operation, animations, from, to, loop, speed, callback, rev) {
    if (!animations)
        return;
    // input can be either single obj or array of objects
    if (typeof animations == "string")
        animations = [animations];

    function processAnimation(animName) {
        var action = v3d.SceneUtils.getAnimationActionByName(appInstance, animName);
        if (!action)
            return;
        switch (operation) {
        case 'PLAY':
            if (!action.isRunning()) {
                action.reset();
                if (loop && (loop != "AUTO"))
                    action.loop = v3d[loop];
                var scene = getSceneByAction(action);
                var frameRate = getSceneAnimFrameRate(scene);

                action.repetitions = Infinity;

                var timeScale = Math.abs(parseFloat(speed));
                if (rev)
                    timeScale *= -1;

                action.timeScale = timeScale;
                action.timeStart = from !== null ? from/frameRate : 0;
                if (to !== null) {
                    action.getClip().duration = to/frameRate;
                } else {
                    action.getClip().resetDuration();
                }
                action.time = timeScale >= 0 ? action.timeStart : action.getClip().duration;

                action.paused = false;
                action.play();

                // push unique callbacks only
                var callbacks = _pGlob.animMixerCallbacks;
                var found = false;

                for (var j = 0; j < callbacks.length; j++)
                    if (callbacks[j][0] == action && callbacks[j][1] == callback)
                        found = true;

                if (!found)
                    _pGlob.animMixerCallbacks.push([action, callback]);
            }
            break;
        case 'STOP':
            action.stop();

            // remove callbacks
            var callbacks = _pGlob.animMixerCallbacks;
            for (var j = 0; j < callbacks.length; j++)
                if (callbacks[j][0] == action) {
                    callbacks.splice(j, 1);
                    j--
                }

            break;
        case 'PAUSE':
            action.paused = true;
            break;
        case 'RESUME':
            action.paused = false;
            break;
        case 'SET_FRAME':
            var scene = getSceneByAction(action);
            var frameRate = getSceneAnimFrameRate(scene);
            action.time = from ? from/frameRate : 0;
            action.play();
            action.paused = true;
            break;
        case 'SET_SPEED':
            var timeScale = parseFloat(speed);
            action.timeScale = rev ? -timeScale : timeScale;
            break;
        }
    }

    for (var i = 0; i < animations.length; i++) {
        var animName = animations[i];
        if (animName)
            processAnimation(animName);
    }

    initAnimationMixer();
}

// whenHovered puzzle
initObjectPicking(function(intersects, event) {

    var prevHovered = _pGlob.hoveredObject;
    var currHovered = '';

    // the event might happen before hover registration
    _pGlob.objHoverInfo = _pGlob.objHoverInfo || [];

    // search for closest hovered object

    var lastIntersectIndex = Infinity;
    _pGlob.objHoverInfo.forEach(function(el) {
        var maxIntersects = el.xRay ? intersects.length : Math.min(1, intersects.length);

        for (var i = 0; i < maxIntersects; i++) {
            var obj = intersects[i].object;
            var objName = getPickedObjectName(obj);

            if (objectsIncludeObj(retrieveObjectNames(el.objSelector), objName) && i <= lastIntersectIndex) {
                currHovered = objName;
                lastIntersectIndex = i;
            }
        }
    });

    if (prevHovered == currHovered) return;

    // first - all "out" callbacks, then - all "over"
    _pGlob.objHoverInfo.forEach(function(el) {
        if (objectsIncludeObj(retrieveObjectNames(el.objSelector), prevHovered)) {
            // ensure the correct value of the hoveredObject block
            _pGlob.hoveredObject = prevHovered;
            el.callbacks[1](event);
        }
    });

    _pGlob.objHoverInfo.forEach(function(el) {
        if (objectsIncludeObj(retrieveObjectNames(el.objSelector), currHovered)) {
            // ensure the correct value of the hoveredObject block
            _pGlob.hoveredObject = currHovered;
            el.callbacks[0](event);
        }
    });

    _pGlob.hoveredObject = currHovered;
}, 'mousemove', false);

// whenHovered puzzle
function registerOnHover(objSelector, xRay, cbOver, cbOut) {

    _pGlob.objHoverInfo = _pGlob.objHoverInfo || [];

    _pGlob.objHoverInfo.push({
        objSelector: objSelector,
        callbacks: [cbOver, cbOut],
        xRay: xRay
    });
}

// getAnimationFrame puzzle
function getAnimationFrame(animName) {
    if (!animName)
        return;
    var action = v3d.SceneUtils.getAnimationActionByName(appInstance, animName);
    if (action) {
        var scene = getSceneByAction(action);
        var frameRate = getSceneAnimFrameRate(scene);
        return action.time * frameRate;
    } else {
        return;
    }
}


registerOnClick('Куб', false, false, [0,1,2], function() {
  changeVis('Куб', false);
}, function() {});
registerOnClick('Icosphere', false, false, [0,1,2], function() {
  setMaterialWireframe('Glass', 'ENABLE');
}, function() {});
registerOnClick('Torus', false, false, [0,1,2], function() {
  zoomCamera('Torus', 1, function() {});
}, function() {});
registerOnClick('Plane', false, false, [0,1,2], function() {
  assignMat('Plane', 'торус');
}, function() {});
registerOnClick('Сцена', false, true, [0,1,2], function() {
  changeVis('Куб', true);
  setMaterialWireframe('Glass', 'DISABLE');
  zoomCamera('Scene', 1, function() {});
  assignMat('Plane', 'ваза');
}, function() {});

registerOnHover(['ALL_OBJECTS'], false, function() {
  outline(_pGlob.hoveredObject, 'ENABLE');

  operateAnimation('PAUSE', _pGlob.hoveredObject, null, null, 'AUTO', 1,
          function() {}, false);

      }, function() {
  outline(_pGlob.hoveredObject, 'DISABLE');
  if (!pause) {

    operateAnimation('RESUME', _pGlob.hoveredObject, null, null, 'AUTO', 1,
            function() {}, false);

        }
});

registerOnClick('Cube', false, false, [0,1,2], function() {
  pause = 1;

  operateAnimation('STOP', 'Icosphere', null, null, 'AUTO', 1,
          function() {}, false);


  operateAnimation('STOP', 'Plane', null, null, 'AUTO', 1,
          function() {}, false);


  operateAnimation('STOP', 'Torus', null, null, 'AUTO', 1,
          function() {}, false);


  operateAnimation('STOP', 'Куб', null, null, 'AUTO', 1,
          function() {}, false);


  operateAnimation('STOP', 'Текст', null, null, 'AUTO', 1,
          function() {}, false);

      }, function() {});
registerOnClick('Cone', false, false, [0,1,2], function() {
  pause = 0;
  if (getAnimationFrame('Текст') == 0) {

    operateAnimation('PLAY', 'Icosphere', null, null, 'AUTO', 1,
            function() {}, false);


    operateAnimation('PLAY', 'Plane', null, null, 'AUTO', 1,
            function() {}, false);


    operateAnimation('PLAY', 'Torus', null, null, 'AUTO', 1,
            function() {}, false);


    operateAnimation('PLAY', 'Куб', null, null, 'AUTO', 1,
            function() {}, false);


    operateAnimation('PLAY', 'Текст', null, null, 'AUTO', 1,
            function() {}, false);

        } else {

    operateAnimation('RESUME', 'Icosphere', null, null, 'AUTO', 1,
            function() {}, false);


    operateAnimation('RESUME', 'Plane', null, null, 'AUTO', 1,
            function() {}, false);


    operateAnimation('RESUME', 'Torus', null, null, 'AUTO', 1,
            function() {}, false);


    operateAnimation('RESUME', 'Куб', null, null, 'AUTO', 1,
            function() {}, false);


    operateAnimation('RESUME', 'Текст', null, null, 'AUTO', 1,
            function() {}, false);

        }
}, function() {});
registerOnClick('Cube.002', false, false, [0,1,2], function() {
  pause = 1;

  operateAnimation('PAUSE', 'Icosphere', null, null, 'AUTO', 1,
          function() {}, false);


  operateAnimation('PAUSE', 'Plane', null, null, 'AUTO', 1,
          function() {}, false);


  operateAnimation('PAUSE', 'Torus', null, null, 'AUTO', 1,
          function() {}, false);


  operateAnimation('PAUSE', 'Куб', null, null, 'AUTO', 1,
          function() {}, false);


  operateAnimation('PAUSE', 'Текст', null, null, 'AUTO', 1,
          function() {}, false);

      }, function() {});



} // end of PL.init function

PL.disposeListeners = function() {
    if (_pGlob) {
        _pGlob.eventListeners.forEach(({ target, type, listener, optionsOrUseCapture }) => {
            target.removeEventListener(type, listener, optionsOrUseCapture);
        });
        _pGlob.eventListeners.length = 0;
    }
}

PL.dispose = function() {
    PL.disposeListeners();
    _pGlob = null;
    // backward compatibility
    if (v3d[Symbol.toStringTag] !== 'Module') {
        delete v3d.PL;
        delete v3d.puzzles;
    }
}



return PL;

}

export { createPL };

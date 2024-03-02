/*!
 * jQuery UI Touch Punch 1.0.9 as modified by RWAP Software
 * based on original touchpunch v0.2.3 which has not been updated since 2014
 *
 * Updates by RWAP Software to take account of various suggested changes on the original code issues
 *
 * Original: https://github.com/furf/jquery-ui-touch-punch
 * Copyright 2011–2014, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Fork: https://github.com/RWAP/jquery-ui-touch-punch
 *
 * Depends:
 * jquery.ui.widget.js
 * jquery.ui.mouse.js
 */

(function( factory ) {
  if ( typeof define === "function" && define.amd ) {

      // AMD. Register as an anonymous module.
      define([ "jquery", "jquery-ui" ], factory );
  } else {

      // Browser globals
      factory( jQuery );
  }
}

(function ($) {

// Detect touch support - Windows Surface devices and other touch devices
$.mspointer = window.navigator.msPointerEnabled;
$.touch = ( 'ontouchstart' in document
   || 'ontouchstart' in window
   || window.TouchEvent
   || (window.DocumentTouch && document instanceof DocumentTouch)
   || navigator.maxTouchPoints > 0
   || navigator.msMaxTouchPoints > 0
);

// Ignore browsers without touch or mouse support
if ((!$.touch && !$.mspointer) || !$.ui.mouse) {
  return;
}

const mouseProto = $.ui.mouse.prototype;
const _mouseInit = mouseProto._mouseInit;
const _mouseDestroy = mouseProto._mouseDestroy;
let touchHandled = false;

/**
* Get the x,y position of a touch event
* @param {Object} event A touch event
*/
function getTouchCoords (event) {
    return {
        x: event.originalEvent.changedTouches[0].pageX,
        y: event.originalEvent.changedTouches[0].pageY
    };
}

/**
 * Simulate a mouse event based on a corresponding touch event
 * @param {Object} event A touch event
 * @param {String} simulatedType The corresponding mouse event
 */
function simulateMouseEvent (event, simulatedType) {

  // Ignore multi-touch events
  if (event.originalEvent.touches.length > 1) {
    return;
  }

  // Ignore input or textarea elements so user can still enter text
  if ($(event.target).is("input") || $(event.target).is("textarea")) {
    return;
  }

  // Prevent "Ignored attempt to cancel a touchmove event with cancelable=false" errors
  if (event.cancelable) {
    event.preventDefault();
  }

  // Initialize the simulated mouse event using the touch event's coordinates
  const touch = event.originalEvent.changedTouches[0];
  const simulatedEvent = new MouseEvent(simulatedType, {
    bubbles: true,
    cancelable: true,
    screenX: touch.screenX,
    screenY: touch.screenY,
    clientX: touch.clientX,
    clientY: touch.clientY,
  });
  
  // Dispatch the simulated event to the target element
  event.target.dispatchEvent(simulatedEvent);
}

/**
 * Handle the jQuery UI widget's touchstart events
 * @param {Object} event The widget element's touchstart event
 */
mouseProto._touchStart = function (event) {

  // Track movement to determine if interaction was a click
  this._startPos = getTouchCoords(event);

  // Ignore the event if another widget is already being handled
  if (touchHandled || !this._mouseCapture(event.originalEvent.changedTouches[0])) {
    return;
  }

  // Set the flag to prevent other widgets from inheriting the touch event
  touchHandled = true;

  // Simulate the mouseover event
  simulateMouseEvent(event, 'mouseover');

  // Simulate the mousemove event
  simulateMouseEvent(event, 'mousemove');

  // Simulate the mousedown event
  simulateMouseEvent(event, 'mousedown');
};

/**
 * Handle the jQuery UI widget's touchmove events
 * @param {Object} event The document's touchmove event
 */
mouseProto._touchMove = function (event) {

  // Ignore event if not handled
  if (!touchHandled) {
    return;
  }

  // Interaction time
  this._moveStartTime = event.timeStamp;

  // Simulate the mousemove event
  simulateMouseEvent(event, 'mousemove');
};

/**
 * Handle the jQuery UI widget's touchend events
 * @param {Object} event The document's touchend event
 */
mouseProto._touchEnd = function (event) {

  // Ignore event if not handled
  if (!touchHandled) {
    return;
  }

  // Simulate the mouseup event
  simulateMouseEvent(event, 'mouseup');

  // Simulate the mouseout event
  simulateMouseEvent(event, 'mouseout');

  // If the touch interaction did not move, it should trigger a click
  // Check for this in two ways - length of time of simulation and distance moved
  // Allow for Apple Stylus to be used also
  const endPos = getTouchCoords(event);
  if (typeof this._moveStartTime !== 'number' ||
      event.originalEvent.changedTouches[0].touchType === 'stylus' ||
      event.timeStamp - this._moveStartTime < 500 ||
      ((Math.abs(endPos.x - this._startPos.x) < 10) &&
      (Math.abs(endPos.y - this._startPos.y) < 10))) {
    // Simulate the click event
    simulateMouseEvent(event, 'click');
  }
  
  // Clear our touch starting time no matter what
  delete this._moveStartTime;

  // Unset the flag to allow other widgets to inherit the touch event
  touchHandled = false;
};

/**
 * A duck punch of the $.ui.mouse _mouseInit method to support touch events.
 * This method extends the widget with bound touch event handlers that
 * translate touch events to mouse events and pass them to the widget's
 * original mouse event handling methods.
 */
mouseProto._mouseInit = function () {

  // Microsoft Surface Support = remove original touch Action
  if ($.support.mspointer) {
    this.element[0].style.msTouchAction = 'none';
  }

  // Delegate the touch handlers to the widget's element
  this.element.on({
    touchstart: $.proxy(this, '_touchStart'),
    touchmove: $.proxy(this, '_touchMove'),
    touchend: $.proxy(this, '_touchEnd')
  });

  // Call the original $.ui.mouse init method
  _mouseInit.call(this);
};

/**
 * Remove the touch event handlers
 */
mouseProto._mouseDestroy = function () {

  // Delegate the touch handlers to the widget's element
  this.element.off({
    touchstart: $.proxy(this, '_touchStart'),
    touchmove: $.proxy(this, '_touchMove'),
    touchend: $.proxy(this, '_touchEnd')
  });

  // Call the original $.ui.mouse destroy method
  _mouseDestroy.call(this);
};

}));
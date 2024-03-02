/*!
 * jQuery UI Touch Punch 0.2.3
 *
 * Copyright 2011–2014, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Edited @horizoncarlo 2024:
 *  - Cleanup of variables
 *  - Use MouseEvent instead of deprecated initMouseEvent
 *  - Use a timed window before counting a touch as moving, instead of a single flag,
 *     to ensure the user gets a click event reliably and doesn't have to delicately touch
 */

// Number of milliseconds before we start considering a touch move to ACTUALLY be a move, and not just a heavy/lazy single touch meant to be a click
const TOUCH_MOVE_PROTECTION_MS = 800;

(function ($) {
  // Detect touch support
  $.support.touch = 'ontouchend' in document;
  if (!$.support.touch) {
    return;
  }

  const mouseProto = $.ui.mouse.prototype;
  const _mouseInit = mouseProto._mouseInit;
  const _mouseDestroy = mouseProto._mouseDestroy;
  let touchHandled = false;

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

    event.preventDefault();

    // Initialize the simulated mouse event using the touch event's coordinates
    const touch = event.originalEvent.changedTouches[0];
    var simulatedEvent = new MouseEvent(simulatedType, {
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
    // Ignore the event if another widget is already being handled
    if (touchHandled || !this._mouseCapture(event.originalEvent.changedTouches[0])) {
      return;
    }

    // Set the flag to prevent other widgets from inheriting the touch event
    touchHandled = true;

    // Simulate all our mouse events
    simulateMouseEvent(event, 'mouseover');
    simulateMouseEvent(event, 'mousemove');
    simulateMouseEvent(event, 'mousedown');
  };

  /**
   * Handle the jQuery UI widget's touchmove events
   * @param {Object} event The document's touchmove event
   */
  mouseProto._touchMove = function (event) {
    if (!touchHandled) {
      return;
    }

    // Track the start of our touch movement
    if (typeof this.touchMoveStart !== 'number') {
      this.touchMoveStart = performance.now();
    }
    
    // Simulate the mouse events
    simulateMouseEvent(event, 'mousemove');
  };

  /**
   * Handle the jQuery UI widget's touchend events
   * @param {Object} event The document's touchend event
   */
  mouseProto._touchEnd = function (event) {
    if (!touchHandled) {
      return;
    }

    // Simulate the mouse events
    simulateMouseEvent(event, 'mouseup');
    simulateMouseEvent(event, 'mouseout');
    
    // Give a bit of breathing room before considering whether a touch was movement or not
    // This makes "clicking" an item much more reliable
    // Basically if the movement event didn't take longer than X milliseconds, we count it as a non-move
    // At which point we fire off a click event
    // If the touch interaction did not move, it should trigger a click
    if (typeof this.touchMoveStart !== 'number' ||
        performance.now() - this.touchMoveStart <= TOUCH_MOVE_PROTECTION_MS) {
      // Simulate the click event
      simulateMouseEvent(event, 'click');
    }
    delete this.touchMoveStart; // No matter what this current touch is done so clear our timer
    
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
    // Delegate the touch handlers to the widget's element
    this.element.bind({
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
    this.element.unbind({
      touchstart: $.proxy(this, '_touchStart'),
      touchmove: $.proxy(this, '_touchMove'),
      touchend: $.proxy(this, '_touchEnd')
    });

    // Call the original $.ui.mouse destroy method
    _mouseDestroy.call(this);
  };
})(jQuery);
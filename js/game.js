/* Oh hey, good luck on your Road Trip! */

const DICE_COUNT = 5; // This is fun to increase
const ROLL_ANIMATION_MS = 100;
const TWIRL_MIN = 3; const TWIRL_RAND = 10; // How many times to twirl the dice before actually rolling them
const HOVER_CLASS = // Necessary due to a rendering bug with Firefox where hovering a dice while it's rolling stops the face from appearing later
  navigator.userAgent.toLowerCase().includes('firefox') ? 'allow-hover-firefox' : 'allow-hover';
const LS_NAMES = { // Hardcoded names for local storage keys
  hasDisplayedIntro: 'hasDisplayedIntro',
  showInstructionPanel: 'showInstructionPanel',
  showOptionsPanel: 'showOptionsPanel',
  showTravelLog: 'showTravelLog',
  showInlineHelp: 'showInlineHelp',
  showSnow: 'showSnow',
  showRoad: 'showRoad',
  useFastMode: 'useFastMode',
  useBackgroundImage: 'useBackgroundImage',
};
const MAX_RESOURCES = {
  fuel: 6,
  fun: 6,
  memories: 6,
  distance: 6
};
const labelObj = {
  traffic: 'Traffic ⚁',
  hunger: 'Hunger ⚂',
  music: 'Music ⚄',
  restStop: 'Rest Stop ⚃',
  lost: 'Lost ⚀',
  scenicDetour: 'Scenic Detour ⚅',
  route: 'Route ⚀',
  travel: 'Travel ⚅'
};
const notify = new Notyf({ duration: 4000, dismissible: true, position: { x: 'left', y: 'bottom' } });

/* Steps of a Turn:
1: Roll all dice
2: MUST reroll, and can +1/-1
3: Have rerolled, can reroll again (Rest Stop, or spend Memories), can +1/-1
4: Placed all dice, can reroll/+1/-1 still, and can Score
After scoring go back to Step 1
*/
let turnState = { count: 0, step: 1, usingRestStop: false, allocatedDice: 0 };
let settings = { // Track which panels/elements are shown on the page
  inlineHelp: getLocalStorageBoolean(LS_NAMES.showInlineHelp, true),
  instructionPanel: getLocalStorageBoolean(LS_NAMES.showInstructionPanel, true),
  optionsPanel: getLocalStorageBoolean(LS_NAMES.showOptionsPanel, true),
  travelPanel: getLocalStorageBoolean(LS_NAMES.showTravelLog, true),
  snow: getLocalStorageBoolean(LS_NAMES.showSnow, false),
  road: getLocalStorageBoolean(LS_NAMES.showRoad, true),
  fastMode: getLocalStorageBoolean(LS_NAMES.useFastMode, false),
  backgroundImage: getLocalStorageBoolean(LS_NAMES.useBackgroundImage, true),
};
let lostDialogState = {
  count: 0, // Count of dice in the Lost slot, pulled from scoreCounter.lost before showing the dialog
  choices: { /* Format is diceNumber: 'fun/fuel' */ },
};
let timerState = { // Track our start/end (in milliseconds) to show the player their speed
  start: 0,
  end: 0,
  current: 0
};
let allDice = []; // Array of our Dice objects
let travelLog = []; // Array of strings noting our resource changes, turn starts, etc.
let lastZIndex = 50; // Track the highest z-index, to ensure that whatever we drag always is on top
let destination = chooseDestination();
let scoreCounter = {};
let resources; // Track our Fuel/Fun/Distance/Memories

init();

function init() {
  // Set some mobile specific options
  if (isMobileSize()) {
    addCSSLink('mobile-css', './css/mobile.css');
    settings.inlineHelp = false;
    settings.backgroundImage = false;
    settings.snow = false;
    settings.road = false;
  }
  setupHotkeys();
  applySnow();
  applyInlineHelp();
  resources = applyStartingResources();
  
  // Populate our initial dice array
  for (let diceIndex = 0; diceIndex < DICE_COUNT; diceIndex++) {
    allDice.push(new Dice(diceIndex, 1));
  }
  
  document.addEventListener('alpine:initialized', () => {
    alpineInit();
  });
}

function alpineInit() {
  // Once we have a reference to Alpine we want to make some variables reactive, so
  //  changes are immediately shown on the UI
  allDice = Alpine.reactive(allDice);
  travelLog = Alpine.reactive(travelLog);
  turnState = Alpine.reactive(turnState);
  settings = Alpine.reactive(settings);
  lostDialogState = Alpine.reactive(lostDialogState);
  timerState = Alpine.reactive(timerState);
  resources = Alpine.reactive(resources);
  
  // Effect listeners when the reactive state changes
  Alpine.effect(() => {
    // Maintain the usingRestStop flag
    turnState.usingRestStop = allDice.filter(currentDice => currentDice.isSelected && currentDice.value === 4).length > 0;
  });
  Alpine.effect(() => {
    // Maintain the allocatedDice count
    turnState.allocatedDice = allDice.filter(currentDice => currentDice.isAllocated).length;
  });
  // TODO Could do an effect on `resources` to save to local storage, so that refreshing the page didn't lose the score. Maybe slightly encode so it's less immediately obvious to edit it to cheat?
  
  $('#footerCar').draggable({
    containment: 'document',
    delay: 125,
    axis: 'y'
  });
  $('#footerCar').click(function(clickEvent) {
    clickFooterCar();
  });
  
  allDice.forEach(currentDice => {
    // Now that our array is rendered we can assign our elements to the allDice
    currentDice.wrapperEle = $('#wrapper' + currentDice.diceIndex);
    currentDice.hoverEle = $('#hover' + currentDice.diceIndex);
    currentDice.diceEle = $('#dice' + currentDice.diceIndex);
    currentDice.originalX = currentDice.wrapperEle.css('left');
    currentDice.originalY = currentDice.wrapperEle.css('top');
    
    currentDice.wrapperEle.draggable({
      containment: 'document',
      delay: 125, // Make clicking less likely to drag an element accidentally
      start: function(event, ui) {
        // Update our z-index to be the highest, so our last dragged item always overlaps anything below it
        $(this).css('z-index', lastZIndex++);
        
        // Also remove any validation border
        markValidDice(currentDice);
        currentDice.isAllocated = false;
        
        // Highlight all applicable droppable zones that have the correct number
        $('.dice-dropzone').each(function(index, dropzoneEle) {
          const dropzoneObj = $(dropzoneEle);
          dropzoneObj.droppable({
            activeClass: (currentDice.value === getDiceAllowed(dropzoneObj)) ?
              'dice-dropzone-active' : '',
            hoverClass: (currentDice.value === getDiceAllowed(dropzoneObj)) ?
              'dice-dropzone-hover' : ''
          });
        });
      },
    });
    // Add the click after draggable so that dragging doesn't fire click
    currentDice.wrapperEle.click(function(clickEvent) {
      // Pass the Shift key to select all matching dice if held while clicking
      toggleDiceSelection(currentDice, clickEvent.shiftKey);
    });
  });
  
  $('.dice-dropzone').droppable({
    drop: function (event, ui) {
      const currentDice = allDice[ui.draggable.attr('data-index')];
      if (currentDice.value === getDiceAllowed($(this))) {
        markValidDice(currentDice);
        currentDice.isAllocated = true;
      }
      else {
        logEvent("Wrong value " + currentDice.value + " in slot " + labelObj[this.id]);
        markInvalidDice(currentDice);
      }
    }
  });
  
  // Show our instructions dialog if we haven't on load before
  if (!getLocalStorageBoolean(LS_NAMES.hasDisplayedIntro)) {
    showInstructionDialog();
    setLocalStorageItem(LS_NAMES.hasDisplayedIntro, true);
  }
  else {
    // Start up the game
    restartGame();
  }
  
  /* TODO - Alternative theme as a racing game?
   *  Lean into the timer aspect, let the player choose roadtrip vs race at the start before launching
   *  Different wallpapers and different terminoloy (Fun = Tires, Memories = Skill, Rest Stop = Pit Stop, etc.)
   *  Could do goofy stuff like "you got in a crash" once per game where the dice are scattered around the corners of the screen so they're harder to drag and drop quickly
   *  Could have each Distance be a "lap", and you do a set number in a race, and it tracks your time for each lap and whether you finished. Since more likely to lose when rushing
  */
}

function resetDicePositions() {
  allDice.forEach(currentDice => {
    currentDice.resetPosition();
  });
}

function tryToEndTurn() {
  if (turnState.step < 3) {
    logEvent("Must reroll the dice");
    notify.error("Must reroll the dice once each turn");
    return;
  }
  if (turnState.allocatedDice < DICE_COUNT) { // Unallocated dice
    logEvent("All dice must be in a valid slot");
    notify.error("Place all your dice into a valid slot (missing " + (DICE_COUNT - turnState.allocatedDice) + ")");
    return;
  }
  
  // Loop through our dice and check where each one ended up - is inside a dropzone? Is it valid?
  scoreCounter = {}; // Format is ID of slot: count of dice in it
  let invalidDice = []; // Array of { value: num, allowed: num, label: string } that are in the wrong slot, to notify the user
  let oneFaceCount = 0, sixFaceCount = 0;
  allDice.forEach(currentDice => {
    $('.dice-dropzone').each(function(index, dropzoneEle) {
      // Determine if our currentDice is inside the current dropzoneEle based on position
      const dropzoneObj = $(dropzoneEle);
      const dicePos = currentDice.wrapperEle.position();
      const dropPos = dropzoneObj.position();
      if ((dicePos.top >= dropPos.top && // Fits Y
          dicePos.top <= dropPos.top + dropzoneObj.outerHeight()) &&
          (dicePos.left >= dropPos.left && // Fits X
          dicePos.left <= dropPos.left + dropzoneObj.outerWidth())) {
        // Track 1s and 6s for Distance validation
        if (currentDice.value === 1) { oneFaceCount++; }
        if (currentDice.value === 6) { sixFaceCount++; }
        
        // Check if the dice number matches the dropzone - if not it's invalid
        if (currentDice.value !== getDiceAllowed(dropzoneObj)) {
          invalidDice.push({
            value: currentDice.value,
            allowed: getDiceAllowed(dropzoneObj),
            label: labelObj[dropzoneEle.id]
          });
          markInvalidDice(currentDice);
        }
        
        // Update our score counter so we can change our record sheet after
        if (typeof scoreCounter[dropzoneEle.id] !== 'number') {
          scoreCounter[dropzoneEle.id] = 0;
        }
        scoreCounter[dropzoneEle.id]++;
      }
    });
  });
  
  // Check for validation cases before continuing
  if (invalidDice.length > 0) { // Dice in the wrong slot
    let message = 'Invalid dice:<ul>';
    invalidDice.forEach(dice => {
      message += '<li>' + dice.label + ' needs ' + dice.allowed + ', has ' + dice.value + '</li>';
    })
    message += '</ul>';
    notify.error(message);
    return;
  }
  
  // Mandatory Distance from Route + Travel
  // Check how many 1s and 6s we have - if we can match them up, then check how many Route + Travel there are
  if (oneFaceCount > 0 && sixFaceCount > 0) {
    let expectedDistance = Math.min(oneFaceCount, sixFaceCount);
    
    // If we didn't meet our expected Distance, then complain
    if (scoreCounter.route !== expectedDistance || scoreCounter.travel !== expectedDistance) {
      logEvent("Must place Route + Travel");
      notify.error("If possible 1s and 6s must be in Route + Travel to get Distance");
      return;
    }
  }
  
  // Also check that we don't have an incomplete Route/Travel combo, aka trying to dump a 1 in there instead of Lost
  if (safeNum(scoreCounter.route) !== safeNum(scoreCounter.travel)) {
    notify.error("Cannot have incomplete Distance, need both Route + Travel");
    return;
  }
  
  // Right before we apply our score, check what the user wants to do with any Lost
  if (safeNum(scoreCounter.lost) > 0) {
    lostDialogState.count = scoreCounter.lost;
    // Note the dialog will do our score application once done
    showLostDialog();
  }
  else {
    // Otherwise if we made it this far all our dice are setup and valid, so we can apply our score!
    endTurn();
  }
}

function applyScore() {
  // We just total all our modifications based on each slot, and apply them
  let fuelChange = 0;
  let funChange = 0;
  let distanceChange = 0;
  let memoryChange = 0; // Each slot % 2
  
  // Calculate our Traffic + Hunger - Music = Fun lost (but none can be gained by excess Music)
  funChange = safeNum(scoreCounter.traffic)*-1 + safeNum(scoreCounter.hunger)*-1 - safeNum(scoreCounter.music)*-1;
  if (funChange > 0) {
    funChange = 0;
  }
  
  // Calculate our Distance
  if (scoreCounter.route > 0 && scoreCounter.travel > 0) {
    distanceChange = Math.min(safeNum(scoreCounter.route), safeNum(scoreCounter.travel));
  }
  
  // Calculate our Rest Stop application, which is either +/- Fuel based on if we got Distance or not
  fuelChange = safeNum(scoreCounter.restStop) * (distanceChange > 0 ? 1 : -1);
  
  // Calculate the Scenic Detours effect on Fun
  funChange += safeNum(scoreCounter.scenicDetour);
  
  // Calculate our Fuel/Fun effect from Lost, depending on what type the user wanted to apply to
  if (safeNum(scoreCounter.lost) > 0) {
    for (let choice in lostDialogState.choices) {
      if (lostDialogState.choices.hasOwnProperty(choice)) {
        if (lostDialogState.choices[choice] === 'fun') {
          funChange -= 2;
        }
        if (lostDialogState.choices[choice] === 'fuel') {
          fuelChange -= 2;
        }
      }
    }
  }
  
  // Calculate how many pairs we got to increase Memories
  for (let key in scoreCounter) {
    if (scoreCounter.hasOwnProperty(key)) {
      memoryChange += Math.floor(safeNum(scoreCounter[key]) / 2);
    }
  }
  
  function resourcePrefix(change) {
    if (typeof change === 'number' && change > 0) {
      return "+";
    }
    return "";
  }
  
  // Log what's going on this turn
  if (fuelChange !== 0) { logEvent(resourcePrefix(fuelChange) + fuelChange + " Fuel"); }
  if (funChange !== 0) { logEvent(resourcePrefix(funChange) + funChange + " Fun"); }
  if (memoryChange !== 0) { logEvent(resourcePrefix(memoryChange) + memoryChange + " Memories"); }
  if (distanceChange !== 0) { logEvent(resourcePrefix(distanceChange) + distanceChange + " Distance"); }
  
  // Finally modify our resources by the changes
  resources.fuel += fuelChange;
  resources.fun += funChange;
  changeDistance(distanceChange);
  changeMemories(memoryChange);
  
  // Check for maximum Fuel and Fun
  // Note Memories are safely handled in the function above
  if (resources.fuel > MAX_RESOURCES.fuel) { resources.fuel = MAX_RESOURCES.fuel; }
  if (resources.fun > MAX_RESOURCES.fun) { resources.fun = MAX_RESOURCES.fun; }
}

function startTimer() {
  timerState.start = performance.now();
  timerState.current = performance.now();
  
  timerState.interval = setInterval(() => {
    timerState.current = performance.now();
  }, 450);
}

function endTimer() {
  timerState.end = performance.now();
  
  if (timerState.interval) {
    clearInterval(timerState.interval);
  }
  timerState.current = 0;
}

function restartGame() {
  let timeout = hasEndOverlay() ? 750 : 0;
  closeEndOverlay();
  
  // Reset our scroll position
  document.body.scrollTop = document.documentElement.scrollTop = 0;
  
  // 60% of the time, it hue shifts every time
  if (Math.random() >= 0.4) {
    $('#footerCar').css('filter', 'hue-rotate(' + randomDegrees() + ')');
  }
  
  // Start the new game after a slight delay to let the overlay close
  setTimeout(() => {
    logEvent("🌄 New game started!");
    turnState.count = 0;
    randomizeDiceColors();
    applyBackgroundImage();
    applyStartingResources();
    startTimer();
    startTurn();
  }, timeout);
}

function startTurn() {
  turnState.step = 1;
  turnState.count++;
  logEvent("Turn " + turnState.count);
  rollAllDice();
}

function endTurn() {
  // Apply and reset our score for the turn
  applyScore();
  scoreCounter = {};
  
  // Check if we won or lost and start a new turn
  setTimeout(() => {
    let gameOver = false;
    if (resources.fuel <= 0) {
      logEvent("You lose! Ran out of Fuel");
      gameOver = true;
    }
    else if (resources.fun <= 0) {
      logEvent("You lose! Ran out of Fun");
      gameOver = true;
    }
    else if (resources.distance >= MAX_RESOURCES.distance) {
      logEvent("You won the game!");
      logEvent("Totals: Fuel=" + resources.fuel + ", Fun=" + resources.fun + ", Memories=" + resources.memories);
      gameOver = true;
    }
    
    if (gameOver) {
      // TODO Store a history of our last 5 runs in local storage and put a UI element to view them? Could also track a personal best as well (as a separate item, between all runs ever)
      // TODO Online scoreboard with a Bun/Node backing? TOTALLY wouldn't be hackable lol
      endTimer(); // Stop tracking our time
      logEvent("Duration: " + formatTimer(timerState.end - timerState.start, true));
      showEndOverlay();
    }
    else {
      startTurn();
    }
  }, 250); // Intentionally wait a tiny bit, so the dice don't just start re-rolling and confuse the user
}

function applyStartingResources() {
  // Bit of a hack, but we want to maintain the Alpine.js reactivity
  //  Which re-assigning resources to a new {} seems to stop
  //  So instead if we have existing resources, use those instead, aka restarting the game later
  const toReturn = resources ? resources : {};
  toReturn.fuel = 3;
  toReturn.fun = 3;
  toReturn.memories = 3;
  toReturn.distance = 0;
  changeDistance(toReturn.distance, true);
  return toReturn;
}

function changeLostChoice(index, val) {
  lostDialogState.choices[index] = val;
}

function submitLostDialog(allFun) {
  if (typeof allFun === 'boolean') { // All to Fun or Fuel, otherwise just use our .choices directly
    for (let i = 0; i < lostDialogState.count; i++) {
      changeLostChoice(i, allFun ? 'fun' : 'fuel');
    }
  }
  
  closeLostDialog();
  Alpine.nextTick(() => endTurn());
}

function showConfirmNewDialog() {
  document.getElementById('confirmNewDialog').showModal();
}

function closeConfirmNewDialog() {
  document.getElementById('confirmNewDialog').close();
}

function showLostDialog() {
  // Has to be a better way, but for the initial implementation we manually reset our radio buttons
  for (let i = 1; i <= lostDialogState.count; i++) {
    try{
      document.getElementById('radioFun' + i).checked = false;
      document.getElementById('radioFuel' + i).checked = false;
    }catch (silent) { /* If we can't find the elements not a big deal, they might not be initialized yet */ }
  }
  
  document.getElementById('lostDialog').showModal();
}

function closeLostDialog() {
  document.getElementById('lostDialog').close();
}

function showInstructionDialog() {
  // An old ranger trick to remove event listeners by cloning the node
  const oldPlayDialog = document.getElementById('playDialog');
  const newPlayDialog = oldPlayDialog.cloneNode(true);
  oldPlayDialog.parentNode.replaceChild(newPlayDialog, oldPlayDialog);
  newPlayDialog.addEventListener('close', (event) => {
    // First time displaying the dialog, so start the game
    if (turnState.count === 0) {
      restartGame();
    }
  });
  newPlayDialog.showModal();
}

function closeInstructionDialog() {
  document.getElementById('playDialog').close();
}

function hasEndOverlay() {
  return $('#endOverlay').css('display') === 'block';
}

function showEndOverlay() {
  const overlay = $('#endOverlay');
  overlay.css('display', 'block');
  Alpine.nextTick(() => overlay.css('opacity', '1'));
}

function closeEndOverlay() {
  const overlay = $('#endOverlay');
  overlay.css('opacity', '0');
  setTimeout(() => {
    overlay.css('display', 'none');
  }, 1000);
}

function rollAllDice() {
  turnState.step++;
  
  // Reset our dice before rolling them all
  resetDicePositions();
  deselectAllDice();
  setAllDiceUnallocated();
  
  allDice.forEach(currentDice => this.processDice(currentDice));
}

function toggleDiceSelection(diceObj, selectAll) {
  // Ignore selection if we're rolling
  if (!diceObj.isRolling) {
    diceObj.isSelected = !diceObj.isSelected;
    
    // Apply our same flag to any matching faces if requested
    if (selectAll) {
      allDice.forEach(currentDice => {
        if (diceObj.value === currentDice.value) {
          currentDice.isSelected = diceObj.isSelected;
        }
      });
    }
  }
}

function getSelectedDice() {
  return allDice.filter(dice => dice.isSelected);
}

function deselectAllDice() {
  allDice.forEach(currentDice => currentDice.isSelected = false);
}

function setAllDiceUnallocated() {
  allDice.forEach(currentDice => {
    currentDice.isAllocated = false;
  });
}

function rerollSelected() {
  const selectedDice = getSelectedDice();
  
  // Before anything make sure our selected dice are valid: at least 1, and if multiple they are all the same face
  if (selectedDice.length === 0) {
    // Do nothing without dice - don't even need to warn the user
    return;
  }
  else if (selectedDice.length > 1) {
    // If we have multiple dice they need to be the same face
    if (selectedDice.filter(currentDice => currentDice.value !== selectedDice[0].value).length > 0) {
      notify.error("Select a single dice or only those with matching faces");
      return;
    }
  }
  
  // If we're JUST rerolling Rest Stops, then it's free and doesn't advance our steps
  if (!turnState.usingRestStop) {
    // If this is our first reroll we can just do it for free
    if (turnState.step === 2) {
      turnState.step++;
    }
    // Otherwise check if we have enough Memories
    else {
      if (resources.memories < 2) {
        notify.error("Not enough Memories to reroll");
        return;
      }
      
      // We reroll at a Memories cost
      logEvent("Spent 2 Memories to reroll");
      changeMemories(-2);
    }
  }
  
  // If we made it this far let's do the actual reroll now
  selectedDice.forEach(selected => {
    selected.resetPosition();
    processDice(selected);
  });
  
  // Deselect all our dice after rolling selected
  deselectAllDice();
}

function modifySelected(faceMod) {
  // Spend 2 Memories to change the selected dice by the passed face mod
  // Note this only works with a single selected dice
  const selectedDice = getSelectedDice();
  if (selectedDice.length === 1) {
    if (resources.memories < 2) {
      notify.error("Not enough Memories to spend. Need at least 2");
      return;
    }
    
    const potentialValue = selectedDice[0].value + faceMod;
    if (potentialValue > 0 && potentialValue <= 6) {
      changeDice(selectedDice[0], potentialValue);
      selectedDice[0].resetPosition();
      logEvent("Spent 2 Memories to modify");
      changeMemories(-2);
      deselectAllDice();
      notify.success("Spent 2 Memories to change dice to " + potentialValue);
    }
    else if (potentialValue <= 0) {
      notify.error("Can't modify - dice is already a 1");
    }
    else if (potentialValue > 6) {
      notify.error("Can't modify - dice is already a 6");
    }
  }
  else if (selectedDice.length > 1) {
     notify.error("Select only a single dice to modify by spending Memories");
  }
}

function processDice(diceObj) {
  // Mark that we're rolling, and don't allow the hover effect or validation border
  diceObj.isRolling = true;
  diceObj.hoverEle.removeClass(HOVER_CLASS);
  markValidDice(diceObj);
  
  let maxSpins = randomRange(TWIRL_MIN, TWIRL_RAND);
  if (settings.fastMode) {
    maxSpins = 1;
  }
  for (let i = 0; i <= maxSpins; i++) {
    setTimeout(() => {
      this.twirlDice(diceObj, i === maxSpins);
    }, (ROLL_ANIMATION_MS+10) * i); // Slightly increase the animation, this gives a barely noticeable pause on each rotation
  }
}

function twirlDice(diceObj, reset) {
  if (reset) {
    diceObj.diceEle.css('transform', 'rotateX(0deg) rotateY(0deg)');
    
    // Finish our twirling, then ACTUALLY roll the dice to it's final value
    setTimeout(() => {
      diceObj.diceEle.css('transform', '');
    }, 1);
    setTimeout(() => {
      this.rollDice(diceObj);
    }, 10);
  }
  else {
    diceObj.diceEle.css('transform',
      'rotateX(' + randomDegrees() + ') ' +
      'rotateY(' + randomDegrees() + ')');
  }
}

function rollDice(diceObj) {
  // Guess what? We're rolling the dice
  changeDice(diceObj, D6());
  
  // Re-enable the hover class
  diceObj.hoverEle.addClass(HOVER_CLASS);
  
  // Mark we're done rolling once the animation completes
  setTimeout(() => {
    diceObj.isRolling = false;
  }, ROLL_ANIMATION_MS);
}

function changeDice(diceObj, newVal) {
  // Remove our old "show-X" class for our previous face
  // Set the new value to our object
  // Apply the new "show-Y" class to match
  diceObj.diceEle.removeClass('show-' + diceObj.value);
  diceObj.value = newVal;
  diceObj.diceEle.addClass('show-' + diceObj.value);
}

function changeMemories(amount) {
  resources.memories += amount;
  if (resources.memories < 0) { resources.memories = 0; }
  if (resources.memories > MAX_RESOURCES.memories) { resources.memories = MAX_RESOURCES.memories; }
}

function changeDistance(amount, setInstead) {
  if (!resources) {
    return;
  }
  
  if (setInstead) {
    resources.distance = amount;
  }
  else {
    resources.distance += amount;
  }
  
  function speedyFooterCarAnim() {
    // Temporarily reset our animation to super fast, then back to normal
    footerCar.css('transition', 'left 500ms');
    if (isAlpineReady()) {
      Alpine.nextTick(() => {
        footerCar.css('transition', 'left 10s');
      });
    }
  }
  
  function moveFooterCar() {
    if (resources.distance > 0) {
      const totalWidth = document.body.clientWidth;
      const segmentWidth = totalWidth/MAX_RESOURCES.distance;
      footerCar.css('left', (resources.distance * segmentWidth) + 'px');
      
      if (resources.distance >= MAX_RESOURCES.distance) {
        // Hard cap our distance at the very end of the screen, to stop scrollbars
        footerCar.css('left', (totalWidth - footerCar.width()) + 'px');
        speedyFooterCarAnim();
      }
    }
    else {
      // Quick reset when resetting to the start
      footerCar.css('left', '0px');
      speedyFooterCarAnim();
    }
  }
  
  const footerCar = $('#footerCar');
  moveFooterCar();
}

function getProgressWidth(resource, max) {
  let percent = (resource / max * 100);
  if (percent > 100) { percent = 100; }
  return 'width: ' + percent + '%;';
}

function markInvalidDice(diceObj) {
  // An invalid dice means a red border
  diceObj.wrapperEle.css('box-shadow', '0 0 10px inset red'); 
}

function markValidDice(diceObj) {
  // Clear any validation border if we're valid
  diceObj.wrapperEle.css('box-shadow', '');
}

function toggleInstructions() { toggleStoredItem('instructionPanel', LS_NAMES.showInstructionPanel); }
function toggleOptions() { toggleStoredItem('optionsPanel', LS_NAMES.showOptionsPanel); }
function toggleTravelLog() { toggleStoredItem('travelPanel', LS_NAMES.showTravelLog); }
function toggleFastMode() { toggleStoredItem('fastMode', LS_NAMES.useFastMode); }
function toggleInlineHelp() { toggleStoredItem('inlineHelp', LS_NAMES.showInlineHelp, applyInlineHelp); }
function toggleBackgroundImage() { toggleStoredItem('backgroundImage', LS_NAMES.useBackgroundImage, applyBackgroundImage); }
function toggleSnow() { toggleStoredItem('snow', LS_NAMES.showSnow, applySnow); }
function toggleRoad() { toggleStoredItem('road', LS_NAMES.showRoad); }
function toggleStoredItem(settingsVarName, storageName, optionalCallback) {
  settings[settingsVarName] = !settings[settingsVarName];
  setLocalStorageItem(storageName, settings[settingsVarName]);
  if (typeof optionalCallback === 'function') {
    optionalCallback();
  }
}

function applyInlineHelp() {
  $('.dice-helper').toggle(settings.inlineHelp);
  $('.dice-helper-text').toggle(settings.inlineHelp);
  $('.dice-helper-text-big').toggle(settings.inlineHelp);
  $('.dice-dropzone').toggleClass('dropzone-pad', !settings.inlineHelp);
}

function applySnow() {
  // Just for fun force snow in December
  if (!settings.snow && (new Date().getMonth() === 11)) {
    // Notify only if the user tries to change after initialization
    if (isAlpineReady()) {
      notify.success('Festive spirit is mandatory');
    }
    toggleSnow();
    return;
  }
  
  if (settings.snow) {
    initSnow();
  }
  else {
    removeSnow();
  }
}

function setupHotkeys() {
  window.addEventListener('keyup', (event) => {
    if (event && !hasEndOverlay()) {
      if (event.key === 'r' || event.key === 'R') { rerollSelected(); }
      else if (event.key === 'e' || event.key === 'E') { tryToEndTurn(); }
      else if (event.key === 'd' || event.key === 'D') { randomizeDiceColors(); }
      else if (event.key === 'h' || event.key === 'H') { toggleInlineHelp(); }
      else if (event.key === '+' || event.key === '=') { modifySelected(1); }
      else if (event.key === '-' || event.key === '_') { modifySelected(-1); }
      else if (event.key === '1') { toggleDiceSelection(allDice[0]); }
      else if (event.key === '2') { toggleDiceSelection(allDice[1]); }
      else if (event.key === '3') { toggleDiceSelection(allDice[2]); }
      else if (event.key === '4') { toggleDiceSelection(allDice[3]); }
      else if (event.key === '5') { toggleDiceSelection(allDice[4]); }
      else if (event.key === '6') { toggleDiceSelection(allDice[5]); }
      else if (event.key === '!') { toggleDiceSelection(allDice[0], true); }
      else if (event.key === '@') { toggleDiceSelection(allDice[1], true); }
      else if (event.key === '#') { toggleDiceSelection(allDice[2], true); }
      else if (event.key === '$') { toggleDiceSelection(allDice[3], true); }
      else if (event.key === '%') { toggleDiceSelection(allDice[4], true); }
      else if (event.key === '^') { toggleDiceSelection(allDice[5], true); }
    }
  });
}

function getDiceAllowed(dropzoneObj) {
  if (dropzoneObj) {
    const potentialValue = dropzoneObj.attr('dice-allowed');
    if (potentialValue && !isNaN(parseInt(potentialValue))) {
      return parseInt(potentialValue);
    }
  }
  return -1;
}

function logEvent(event) {
  travelLog.push(event);
  
  // Scroll to the bottom of the log
  const scrollEle = document.getElementById('travelLogScroll');
  if (scrollEle) {
    Alpine.nextTick(() => scrollEle.scrollTo(0, scrollEle.scrollHeight));
  }
}

function clickFooterCar() {
  const footerCar = $('#footerCar');
  if (footerCar) {
    // Our first move is a bigger one, to let the user clicking does something
    if (footerCar.css('left') === '0px') {
      footerCar.css('left', (parseInt(footerCar.css('left'))+20) + 'px');
    }
    // After that it's painfully, PAINFULLY slow
    else if (Math.random() > 0.3) {
      footerCar.css('left', (parseInt(footerCar.css('left'))+1) + 'px');
    }
  }
}

const BACKGROUND_IMAGES = [
  'background-01.jpg',
  'background-02.jpg',
  'background-03.jpg',
  'background-04.jpg',
  'background-05.jpg',
  'background-06.jpg',
  'background-07.jpg',
  'background-08.jpg',
  'background-09.jpg',
  'background-10.jpg',
  'background-11.jpg',
  'background-12.jpg',
  'background-13.jpg',
  'background-14.jpg',
  'background-15.jpg',
  'background-16.jpg',
  'background-17.jpg',
  'background-18.jpg',
  'background-19.jpg',
  'background-20.jpg',
  'background-21.jpg',
  'background-22.jpg',
  'background-23.jpg',
  'background-24.jpg',
  'background-25.jpg',
  'background-26.jpg',
  'background-27.jpg',
  'background-28.jpg',
  'background-29.jpg',
  'background-30.jpg',
  'background-31.jpg',
  'background-32.jpg',
  'background-33.jpg',
  'background-34.jpg',
  'background-35.jpg',
  'background-36.jpg',
  'background-37.jpg',
  'background-38.jpg',
  'background-39.jpg',
  'background-40.jpg',
  'background-41.jpg',
];
function applyBackgroundImage() {
  if (settings.backgroundImage) {
    const selected = BACKGROUND_IMAGES[randomRange(0, BACKGROUND_IMAGES.length-1)];
    document.body.style.backgroundImage = "url('./backgrounds/" + selected + "')";
  }
  else {
    document.body.style.backgroundImage = '';
  }
}

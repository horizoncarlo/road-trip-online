/* Oh hey, good luck on your Road Trip! */

const DICE_COUNT = 5;
const ROLL_ANIMATION_MS = 100;
const TWIRL_MIN = 3; const TWIRL_RAND = 7; // How many times to twirl the dice before actually rolling them
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
const notify = new Notyf();

class Dice {
  constructor(diceIndex, value, isSelected, isRolling, wrapperEle, hoverEle, diceEle, originalX, originalY) {
    this.diceIndex = diceIndex;
    this.value = value;
    this.isSelected = isSelected || false;
    this.isRolling = isRolling || false;
    // Dice are laid out as 3 divs: wrapper, then hover, then dice (then all the faces/pips inside that)
    this.wrapperEle = wrapperEle;
    this.hoverEle = hoverEle;
    this.diceEle = diceEle;
    this.originalX = originalX;
    this.originalY = originalY;
  }
}

// Fancier and more reliable random generator
const MersenneTwister=function(t){null==t&&(t=(new Date).getTime()),this.N=624,this.M=397,this.MATRIX_A=2567483615,this.UPPER_MASK=2147483648,this.LOWER_MASK=2147483647,this.mt=new Array(this.N),this.mti=this.N+1,this.init_genrand(t)};MersenneTwister.prototype.init_genrand=function(t){for(this.mt[0]=t>>>0,this.mti=1;this.mti<this.N;this.mti++){t=this.mt[this.mti-1]^this.mt[this.mti-1]>>>30;this.mt[this.mti]=(1812433253*((4294901760&t)>>>16)<<16)+1812433253*(65535&t)+this.mti,this.mt[this.mti]>>>=0}},MersenneTwister.prototype.init_by_array=function(t,i){var s,h,m;for(this.init_genrand(19650218),s=1,h=0,m=this.N>i?this.N:i;m;m--){var n=this.mt[s-1]^this.mt[s-1]>>>30;this.mt[s]=(this.mt[s]^(1664525*((4294901760&n)>>>16)<<16)+1664525*(65535&n))+t[h]+h,this.mt[s]>>>=0,h++,++s>=this.N&&(this.mt[0]=this.mt[this.N-1],s=1),h>=i&&(h=0)}for(m=this.N-1;m;m--){n=this.mt[s-1]^this.mt[s-1]>>>30;this.mt[s]=(this.mt[s]^(1566083941*((4294901760&n)>>>16)<<16)+1566083941*(65535&n))-s,this.mt[s]>>>=0,++s>=this.N&&(this.mt[0]=this.mt[this.N-1],s=1)}this.mt[0]=2147483648},MersenneTwister.prototype.genrand_int32=function(){var t,i=new Array(0,this.MATRIX_A);if(this.mti>=this.N){var s;for(this.mti==this.N+1&&this.init_genrand(5489),s=0;s<this.N-this.M;s++)t=this.mt[s]&this.UPPER_MASK|this.mt[s+1]&this.LOWER_MASK,this.mt[s]=this.mt[s+this.M]^t>>>1^i[1&t];for(;s<this.N-1;s++)t=this.mt[s]&this.UPPER_MASK|this.mt[s+1]&this.LOWER_MASK,this.mt[s]=this.mt[s+(this.M-this.N)]^t>>>1^i[1&t];t=this.mt[this.N-1]&this.UPPER_MASK|this.mt[0]&this.LOWER_MASK,this.mt[this.N-1]=this.mt[this.M-1]^t>>>1^i[1&t],this.mti=0}return t=this.mt[this.mti++],t^=t>>>11,t^=t<<7&2636928640,t^=t<<15&4022730752,(t^=t>>>18)>>>0},MersenneTwister.prototype.random=function(){return this.genrand_int32()*(1/4294967296)};
const rand = new MersenneTwister();

let allDice = []; // Array of our Dice objects
let lastZIndex = 50; // Track the highest z-index, to ensure that whatever we drag always is on top
let lostUsageDialog;
let lostEffectsFun = false; // If true any Lost dice will apply to Fun, otherwise on false to Fuel
let scoreCounter = {};
// TODO Allow customization of these starting values
let resources = { // Track our Fuel/Fun/Distance/Memories
  fuel: 3,
  fun: 3,
  memories: 3,
  distance: 0
};

function init() {
  setupLostUsageDialog();
  
  // Populate our initial dice array
  for (let diceIndex = 0; diceIndex < DICE_COUNT; diceIndex++) {
    allDice.push(new Dice(diceIndex, 1));
  }
  
  document.addEventListener('alpine:initialized', () => {
    // Once we have a reference to Alpine we want to make our array reactive, so any changes
    //  to the dice are immediately shown on the UI
    allDice = Alpine.reactive(allDice);
    
    // Also setup our Resources as reactive
    resources = Alpine.reactive(resources);
    
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
          
          // Highlight all applicable droppable zones that have the correct number
          $('.dice-dropzone').each(function(index, dropzoneEle) {
            const dropzoneObj = $(dropzoneEle);
            dropzoneObj.droppable({
              activeClass: (currentDice.value == dropzoneObj.attr('dice-allowed')) ?
                'dice-dropzone-active' : '',
              hoverClass: (currentDice.value == dropzoneObj.attr('dice-allowed')) ?
                'dice-dropzone-hover' : ''
            });
          });
        },
      });
      // Add the click after draggable so that dragging doesn't fire click
      currentDice.wrapperEle.click(function() {
        // Ignore selection if we're rolling
        if (!currentDice.isRolling) {
          toggleDiceSelection(currentDice);
        }
      });
    });
    
    $('.dice-dropzone').droppable({
      drop: function (event, ui) {
        const currentDice = allDice[ui.draggable.attr('data-index')];
        if (currentDice.value == $(this).attr('dice-allowed')) {
          markValidDice(currentDice);
        }
        else {
          markInvalidDice(currentDice);
        }
      }
    });
    
    // Do an initial roll
    rollAllDice();
  });
}
init();

function resetDicePositions() {
  allDice.forEach(currentDice => {
    currentDice.wrapperEle.css('left', currentDice.originalX);
    currentDice.wrapperEle.css('top', currentDice.originalY);
    markValidDice(currentDice); // Also clear all borders
  });
}

function tryToScore() {
  // Loop through our dice and check where each one ended up - is inside a dropzone? Is it valid?
  scoreCounter = {}; // Format is ID of slot: count of dice in it
  let invalidDice = []; // Array of { value: num, allowed: num, label: string } that are in the wrong slot, to notify the user
  let allocatedCount = 0; // Any unallocated dice (that aren't put in a slot)
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
        // Track how many dice we've allocated properly into a slot
        allocatedCount++;
        
        // Also track 1s and 6s for Distance validation
        if (currentDice.value === 1) { oneFaceCount++; }
        if (currentDice.value === 6) { sixFaceCount++; }
        
        // Check if the dice number matches the dropzone - if not it's invalid
        if (currentDice.value != dropzoneObj.attr('dice-allowed')) {
          invalidDice.push({
            value: currentDice.value,
            allowed: parseInt(dropzoneObj.attr('dice-allowed')),
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
    let message = 'Dice are in the wrong spot:<ul>';
    invalidDice.forEach(dice => {
      message += '<li>' + dice.label + ' has value ' + dice.value + ' instead of ' + dice.allowed + '</li>';
    })
    message += '</ul>';
    notify.error(message);
    return;
  }
  if (allocatedCount < DICE_COUNT) { // Unallocated dice
    notify.error("Place all your dice into a slot (missing " + (DICE_COUNT - allocatedCount) + ")");
    return;
  }
  
  // Mandatory Distance from Route + Travel
  // Check how many 1s and 6s we have - if we can match them up, then check how many Route + Travel there are
  if (oneFaceCount > 0 && sixFaceCount > 0) {
    let expectedDistance = Math.min(oneFaceCount, sixFaceCount);
    
    // If we didn't meet our expected Distance, then complain
    if (scoreCounter.route !== expectedDistance || scoreCounter.travel !== expectedDistance) {
      notify.error("You must try to get Distance by filling in Route + Travel first");
      return;
    }
  }
  
  // Right before we apply our score, check what the user wants to do with any Lost
  if (safeNum(scoreCounter.lost) > 0) {
    // Note the dialog will do our score application once done
    askForLostUsage();
  }
  else {
    // Otherwise if we made it this far all our dice are setup and valid, so we can apply our score!
    applyScore(scoreCounter);
  }
}

function applyScore(scoreCounter) {
  console.log("Slot details", scoreCounter);
  
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
  if (lostEffectsFun) {
    funChange += safeNum(scoreCounter.lost) * -2;
  }
  else {
    fuelChange += safeNum(scoreCounter.lost) * -2;
  }
  
  // Calculate how many pairs we got to increase Memories
  for (let key in scoreCounter) {
    if (scoreCounter.hasOwnProperty(key)) {
      memoryChange += Math.floor(safeNum(scoreCounter[key]) / 2);
    }
  }
  
  // Finally modify our resources by the changes
  console.log("Score changes: fuel=" + fuelChange + " fun=" + funChange + " distance=" + distanceChange + " memory=" + memoryChange);
  resources.fuel += fuelChange;
  resources.fun += funChange;
  resources.distance += distanceChange;
  resources.memories += memoryChange;
  
  // Check for maximum Fun/Fuel/Memories
  if (resources.fuel > 6) { resources.fuel = 6; }
  if (resources.fun > 6) { resources.fun = 6; }
  if (resources.memories > 6) { resources.memories = 6; }
  
  // Check if we won or lost
  Alpine.nextTick(() => {
    setTimeout(() => { // TODO Need to wait an extra setTimeout because we're temporarily using an alert() which blocks the page from processing changes
      checkForVictoryOrDefeat();
    }, 100);
  }); // Let the page render updates (primarily our resources count) before checking
}

function checkForVictoryOrDefeat() {
  // TODO Determine if we lost or won, and notify in a cleaner way, plus restarting the game
  if (resources.fuel <= 0) {
    alert("You lose! Ran out of Fuel :(");
    location.reload();
  }
  if (resources.fun <= 0) {
    alert("You lose! Ran out of Fun :(");
    location.reload();
  }
  if (resources.distance >= 6) {
    alert("You won and reached your destination!"); // TODO Could be fun to randomize destinations, and show a little car with a progress bar at the top of the page for Distance
    location.reload();
  }
}

function safeNum(val) {
  // Return 0 if our number is undefined
  return typeof val === 'number' ? val : 0;
}

function setupLostUsageDialog() {
  // TODO Let the user choose where EACH Lost dice applies, via radio buttons in the dialog. Submit buttons would be "Confirm", "All Fun", "All Fuel"
  lostUsageDialog = $('#dialog-lost').dialog({
    autoOpen: false,
    modal: true,
    resizable: false,
    draggable: false,
    height: 'auto',
    width: 400,
    buttons: {
      'Fuel': function() {
        $(this).dialog('close');
        Alpine.nextTick(() => { // Make sure the dialog is closed before processing
          lostEffectsFun = false;
          applyScore(scoreCounter);
        });
      },
      'Fun': function() {
        $(this).dialog('close');
        Alpine.nextTick(() => {
          lostEffectsFun = true;
          applyScore(scoreCounter);
        });
      },
      Cancel: function() {
        $(this).dialog('close');
      }
    }
  });
}

function askForLostUsage() {
  lostUsageDialog.dialog('open');
}

function rollAllDice() {
  deselectAllDice(); // Deselect everything in case
  allDice.forEach(currentDice => this.processDice(currentDice));
}

function toggleDiceSelection(diceObj) {
  diceObj.isSelected = !diceObj.isSelected;
}

function deselectAllDice() {
  allDice.forEach(currentDice => currentDice.isSelected = false);
}

function rerollSelected() {
  // TODO Verify that we're rerolling only a single dice, or multiple BUT of the same face, or a Rest Stop. Otherwise prompt/confirm for Memory usage to do so (or just change button label beforehand)
  
  const selectedDice = allDice.filter(dice => dice.isSelected);
  selectedDice.forEach(selected => {
    processDice(selected);
  });
  // Deselect all our dice after rolling
  deselectAllDice();
}

function processDice(diceObj) {
  // Mark that we're rolling, and don't allow the hover effect or validation border
  diceObj.isRolling = true;
  diceObj.hoverEle.removeClass('allow-hover');
  markValidDice(diceObj);
  
  const maxSpins = randomRange(TWIRL_MIN, TWIRL_RAND);
  console.log("Twirl loops", maxSpins);
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
      'rotateX(' + randomRange(0, 360) + 'deg) ' +
      'rotateY(' + randomRange(0, 360) + 'deg)');
  }
}

function rollDice(diceObj) {
  // Remove our old "show-X" class for our previous face
  // Randomly roll a new value and set to our object
  // Apply the new "show-Y" class to match
  diceObj.diceEle.removeClass('show-' + diceObj.value);
  diceObj.value = D6();
  diceObj.diceEle.addClass('show-' + diceObj.value);
  
  // Re-enable the hover class
  diceObj.hoverEle.addClass('allow-hover');
  
  // Mark we're done rolling once the animation completes
  setTimeout(() => {
    diceObj.isRolling = false;
  }, ROLL_ANIMATION_MS);
  
  // Notify in the logs for now
  console.log("Rolled", diceObj.value);
}

function markInvalidDice(diceObj) {
  // An invalid dice means a red border
  diceObj.wrapperEle.css('box-shadow', '0 0 10px inset red'); 
}

function markValidDice(diceObj) {
  // Clear any validation border if we're valid
  diceObj.wrapperEle.css('box-shadow', '');
}

function randomRange(min, randomCount) {
  return min + Math.floor(rand.random() * randomCount);
}

function D6() {
  return randomRange(1, 6);
}

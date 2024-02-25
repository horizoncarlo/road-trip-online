const DICE_COUNT = 5;
const ROLL_ANIMATION_MS = 100;
const MersenneTwister=function(t){null==t&&(t=(new Date).getTime()),this.N=624,this.M=397,this.MATRIX_A=2567483615,this.UPPER_MASK=2147483648,this.LOWER_MASK=2147483647,this.mt=new Array(this.N),this.mti=this.N+1,this.init_genrand(t)};MersenneTwister.prototype.init_genrand=function(t){for(this.mt[0]=t>>>0,this.mti=1;this.mti<this.N;this.mti++){t=this.mt[this.mti-1]^this.mt[this.mti-1]>>>30;this.mt[this.mti]=(1812433253*((4294901760&t)>>>16)<<16)+1812433253*(65535&t)+this.mti,this.mt[this.mti]>>>=0}},MersenneTwister.prototype.init_by_array=function(t,i){var s,h,m;for(this.init_genrand(19650218),s=1,h=0,m=this.N>i?this.N:i;m;m--){var n=this.mt[s-1]^this.mt[s-1]>>>30;this.mt[s]=(this.mt[s]^(1664525*((4294901760&n)>>>16)<<16)+1664525*(65535&n))+t[h]+h,this.mt[s]>>>=0,h++,++s>=this.N&&(this.mt[0]=this.mt[this.N-1],s=1),h>=i&&(h=0)}for(m=this.N-1;m;m--){n=this.mt[s-1]^this.mt[s-1]>>>30;this.mt[s]=(this.mt[s]^(1566083941*((4294901760&n)>>>16)<<16)+1566083941*(65535&n))-s,this.mt[s]>>>=0,++s>=this.N&&(this.mt[0]=this.mt[this.N-1],s=1)}this.mt[0]=2147483648},MersenneTwister.prototype.genrand_int32=function(){var t,i=new Array(0,this.MATRIX_A);if(this.mti>=this.N){var s;for(this.mti==this.N+1&&this.init_genrand(5489),s=0;s<this.N-this.M;s++)t=this.mt[s]&this.UPPER_MASK|this.mt[s+1]&this.LOWER_MASK,this.mt[s]=this.mt[s+this.M]^t>>>1^i[1&t];for(;s<this.N-1;s++)t=this.mt[s]&this.UPPER_MASK|this.mt[s+1]&this.LOWER_MASK,this.mt[s]=this.mt[s+(this.M-this.N)]^t>>>1^i[1&t];t=this.mt[this.N-1]&this.UPPER_MASK|this.mt[0]&this.LOWER_MASK,this.mt[this.N-1]=this.mt[this.M-1]^t>>>1^i[1&t],this.mti=0}return t=this.mt[this.mti++],t^=t>>>11,t^=t<<7&2636928640,t^=t<<15&4022730752,(t^=t>>>18)>>>0},MersenneTwister.prototype.random=function(){return this.genrand_int32()*(1/4294967296)};
const rand = new MersenneTwister();

let selectedDice = [];
let lastClasses = {};

function init() {
  document.addEventListener('alpine:initialized', () => {
    for (let i = 0; i < DICE_COUNT; i++) {
      $('.dice-wrapper' + i).draggable({
        containment: 'document',
        delay: 125 // Make clicking less likely to drag an element accidentally
      });
      // Add the click after draggable so that dragging doesn't fire click
      $('.dice-wrapper' + i).click(function() {
        selectDice(i);
      });
    }
    
    $('.dice-dropzone').droppable({
      activeClass: 'dice-dropzone-active',
      hoverClass: 'dice-dropzone-hover',
      accept: function (diceObj) {
        // Accept any incoming dice that matches what our slot allows (by face)
        let showStyle = null;
        diceObj.find('.dice').get(0).classList.forEach(classItem => {
          if (classItem && classItem.startsWith('show-')) {
            showStyle = classItem;
          }
        });
        
        if (showStyle) {
          return $(this).hasClass('allow-' + showStyle);
        }
        return false;
      },
      drop: function (event, ui) {
        console.error("DROP THIS", $(this).get(0).classList); // TTODO
      }
    });
    
    // Do an initial roll
    rollAllDice();
  });
}
init();

function applyScore() {
  // Loop through our dice and check where each one ended up - is inside a dropzone? Is it valid?
  for (let i = 0; i < DICE_COUNT; i++) {
    const currentDice = getDiceObject(i);
    $('.dice-dropzone').each(function(index, dropzoneEle) {
      // TTODO Determine if our currentDice is inside the current dropzoneEle based on position
      const dicePos = currentDice.parent().parent().position();
      const dropPos = $(dropzoneEle).position();
      if ((dicePos.top >= dropPos.top && // Fits Y
          dicePos.top <= dropPos.top + $(dropzoneEle).outerHeight()) &&
          (dicePos.left >= dropPos.left && // Fits X
          dicePos.left <= dropPos.left + $(dropzoneEle).outerWidth())) {
        console.error("FITS", currentDice, dropzoneEle);
      }
    });
  }
}

function rollAllDice() {
  for (let i = 0; i < DICE_COUNT; i++) {
    this.processDice(i);
  }
}

function selectDice(diceIndex, noModifyArray) {
  const diceWrapper = $('.dice-wrapper' + diceIndex);
  
  if (!noModifyArray) {
    if (diceWrapper.hasClass('dice-wrapper-selected')) {
      if (selectedDice.indexOf(diceWrapper.get(0)) !== -1) {
        selectedDice.splice(selectedDice.indexOf(diceWrapper.get(0)), 1);
      }
    }
    else {
      selectedDice.push(diceWrapper.get(0));
    }
  }
  
  diceWrapper.toggleClass('dice-wrapper-selected');
}

function rerollSelected() {
  if (selectedDice && selectedDice.length > 0) {
    for (let i = 0; i < selectedDice.length; i++) {
      processDice(selectedDice[i].id);
      selectDice(selectedDice[i].id, true); // Deselect our dice after rolling
    }
    selectedDice = [];
  }
}

function processDice(diceIndex) {
  getHoverWrap(diceIndex).classList.remove('allow-hover');
  
  const maxSpins = 15 + Math.floor(rand.random() * 5);
  console.log("Twirl loops", maxSpins);
  for (let i = 0; i <= maxSpins; i++) {
    setTimeout(() => {
      this.twirlDice(diceIndex, i === maxSpins);
    }, (ROLL_ANIMATION_MS+10) * i);
  }
}

function twirlDice(diceIndex, reset) {
  const dice = getDice(diceIndex);
  
  if (reset) {
    dice.style.transform = 'rotateX(0deg) rotateY(0deg)';
    
    setTimeout(() => {
      dice.style.transform = '';
    }, 1);
    
    setTimeout(() => {
      this.rollDice(diceIndex);
    }, 10);
  }
  else {
    dice.style.transform =
      'rotateX(' + (0 + Math.floor(rand.random() * 360)) + 'deg) ' +
      'rotateY(' + (0 + Math.floor(rand.random() * 360)) + 'deg)';
  }
}

function rollDice(diceIndex) {
  const dice = getDice(diceIndex);
  
  if (lastClasses[diceIndex]) {
    dice.classList.remove(lastClasses[diceIndex]);
  }
  
  const roll = D6();
  const classToAdd = 'show-' + roll;
  lastClasses[diceIndex] = classToAdd;
  dice.classList.add(classToAdd);
  
  getHoverWrap(diceIndex).classList.add('allow-hover');
  
  console.log("Rolled", roll);
}

function D6() {
  return 1 + Math.floor(rand.random() * 6);
}

function getDiceObject(diceIndex) {
  return $('.dice' + diceIndex);
}

function getDice(diceIndex) {
  return getDiceObject(diceIndex).get(0);
}

function getHoverWrap(diceIndex) {
  return $('.hover-wrap' + diceIndex).get(0);
}

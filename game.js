const DICE_COUNT = 5;
const ROLL_ANIMATION_MS = 100;
const MersenneTwister=function(t){null==t&&(t=(new Date).getTime()),this.N=624,this.M=397,this.MATRIX_A=2567483615,this.UPPER_MASK=2147483648,this.LOWER_MASK=2147483647,this.mt=new Array(this.N),this.mti=this.N+1,this.init_genrand(t)};MersenneTwister.prototype.init_genrand=function(t){for(this.mt[0]=t>>>0,this.mti=1;this.mti<this.N;this.mti++){t=this.mt[this.mti-1]^this.mt[this.mti-1]>>>30;this.mt[this.mti]=(1812433253*((4294901760&t)>>>16)<<16)+1812433253*(65535&t)+this.mti,this.mt[this.mti]>>>=0}},MersenneTwister.prototype.init_by_array=function(t,i){var s,h,m;for(this.init_genrand(19650218),s=1,h=0,m=this.N>i?this.N:i;m;m--){var n=this.mt[s-1]^this.mt[s-1]>>>30;this.mt[s]=(this.mt[s]^(1664525*((4294901760&n)>>>16)<<16)+1664525*(65535&n))+t[h]+h,this.mt[s]>>>=0,h++,++s>=this.N&&(this.mt[0]=this.mt[this.N-1],s=1),h>=i&&(h=0)}for(m=this.N-1;m;m--){n=this.mt[s-1]^this.mt[s-1]>>>30;this.mt[s]=(this.mt[s]^(1566083941*((4294901760&n)>>>16)<<16)+1566083941*(65535&n))-s,this.mt[s]>>>=0,++s>=this.N&&(this.mt[0]=this.mt[this.N-1],s=1)}this.mt[0]=2147483648},MersenneTwister.prototype.genrand_int32=function(){var t,i=new Array(0,this.MATRIX_A);if(this.mti>=this.N){var s;for(this.mti==this.N+1&&this.init_genrand(5489),s=0;s<this.N-this.M;s++)t=this.mt[s]&this.UPPER_MASK|this.mt[s+1]&this.LOWER_MASK,this.mt[s]=this.mt[s+this.M]^t>>>1^i[1&t];for(;s<this.N-1;s++)t=this.mt[s]&this.UPPER_MASK|this.mt[s+1]&this.LOWER_MASK,this.mt[s]=this.mt[s+(this.M-this.N)]^t>>>1^i[1&t];t=this.mt[this.N-1]&this.UPPER_MASK|this.mt[0]&this.LOWER_MASK,this.mt[this.N-1]=this.mt[this.M-1]^t>>>1^i[1&t],this.mti=0}return t=this.mt[this.mti++],t^=t>>>11,t^=t<<7&2636928640,t^=t<<15&4022730752,(t^=t>>>18)>>>0},MersenneTwister.prototype.random=function(){return this.genrand_int32()*(1/4294967296)};
const rand = new MersenneTwister();
let lastClasses = {};

function init() {
  document.addEventListener('alpine:initialized', () => {
    for (let i = 0; i < DICE_COUNT; i++) {
      $('.dice-wrapper' + i).draggable({
        containment: 'document',
      });
    }
    
    $( "#trafficDrop" ).droppable({
      drop: function( event, ui ) {
        console.log("DROPPED", event, ui);
        $( this ).html( "Dropped at " + new Date().toLocaleTimeString() );
      }
    });
    
    // Do an initial roll
    rollAllDice();
  });
}
init();

function D6() {
  return 1 + Math.floor(rand.random() * 6);
}

function rollAllDice() {
  for (let i = 0; i < DICE_COUNT; i++) {
    this.clickDice(i);
  }
}

function clickDice(diceIndex) {
  document.querySelector('.hover-wrap' + diceIndex).classList.remove('allow-hover');
  
  const maxSpins = 15 + Math.floor(rand.random() * 5);
  console.log("Twirl loops", maxSpins);
  for (let i = 0; i <= maxSpins; i++) {
    setTimeout(() => {
      this.twirlDice(diceIndex, i === maxSpins);
    }, (ROLL_ANIMATION_MS+10) * i);
  }
}

function twirlDice(diceIndex, reset) {
  const dice = document.querySelector('.dice' + diceIndex);
  
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
  const dice = document.querySelector('.dice' + diceIndex);
  const hoverWrap = document.querySelector('.hover-wrap' + diceIndex);
  
  if (lastClasses[diceIndex]) {
    dice.classList.remove(lastClasses[diceIndex]);
  }
  
  const roll = D6();
  const classToAdd = 'show-' + roll;
  lastClasses[diceIndex] = classToAdd;
  dice.classList.add(classToAdd);
  
  hoverWrap.classList.add('allow-hover');
  
  console.log("Rolled", roll);
}
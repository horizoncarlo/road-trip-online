class Dice {
  constructor(diceIndex, value, isSelected, isAllocated, isRolling, wrapperEle, hoverEle, diceEle, originalX, originalY) {
    this.id = 'dice' + Math.random(); // For use with Alpine.js x-for to track any movement
    this.diceIndex = diceIndex;
    this.value = value;
    this.isSelected = isSelected || false;
    this.isAllocated = isAllocated || false;
    this.isRolling = isRolling || false;
    // Dice are laid out as 3 divs: wrapper, then hover, then dice (then all the faces/pips inside that)
    this.wrapperEle = wrapperEle;
    this.hoverEle = hoverEle;
    this.diceEle = diceEle;
    this.originalX = originalX;
    this.originalY = originalY;
  }
  
  resetPosition() {
    this.wrapperEle.css('left', this.originalX);
    this.wrapperEle.css('top', this.originalY);
    
    // Remove any validation border, and mark us unallocated
    markValidDice(this);
    this.isAllocated = false;
  }
}

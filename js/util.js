function isAlpineReady() {
  return typeof Alpine === 'object';
}

function safeNum(val) {
  // Return 0 if our number is undefined
  return typeof val === 'number' ? val : 0;
}

function getLocalStorageItem(key) {
  return window.localStorage.getItem(key);
}

function getLocalStorageBoolean(key, optionalDefault) {
  const fromStorage = window.localStorage.getItem(key);
  if (!fromStorage && typeof optionalDefault !== 'undefined') {
    return optionalDefault;
  }
  return fromStorage && fromStorage === 'true' ? true : false;
}

function setLocalStorageItem(key, value) {
  window.localStorage.setItem(key, value);
}

function removeLocalStorageItem(key) {
  window.localStorage.removeItem(key);
}

function randomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  
  return color;
}

function randomDegrees() {
  return randomRange(0, 360) + 'deg';
}

function randomRange(min, max) {
  let randomNumber = 0;
  if (window && window.crypto) {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    randomNumber = randomBuffer[0] / (0xffffffff + 1);
  }
  else {
    randomNumber = Math.random();
  }
  
  return Math.floor(randomNumber * (max - min + 1)) + min;
}

function D6() {
  return randomRange(1, 6);
}

function isMobileSize() {
  return window.matchMedia("(max-width: 850px)").matches;
}

function addCSSLink(id, href) {
  // If we already have the element, just bail
  if (document.getElementById(id)) {
    return;
  }
  // Otherwise add the CSS link for the sheet to the head
  const toAdd = document.createElement('link');
  toAdd.id = id;
  toAdd.rel = 'stylesheet';
  toAdd.type = 'text/css';
  toAdd.href = href;
  document.head.appendChild(toAdd);
}

function initSnow() {
  // Import the CSS first as needed
  addCSSLink('snow-css', './css/snow.css');
  
  const snowflakes = document.createElement('div');
  snowflakes.id = 'snowflakes';
  for (let i = 0; i < randomRange(10, 15); i++) {
      const currentSnowflake = document.createElement('div');
      currentSnowflake.className = 'snowflake';
      
      const type = Math.random();
      if (type <= 0.33) {
          currentSnowflake.innerHTML = '&#10052;';
      }
      else if (type <= 0.66) {
          currentSnowflake.innerHTML = '&#10053;';
      }
      else {
          currentSnowflake.innerHTML = '&#10054;';
      }
      snowflakes.appendChild(currentSnowflake);
  }
  document.body.appendChild(snowflakes);
}

function removeSnow() {
  if (document.getElementById('snowflakes')) {
      document.body.removeChild(document.getElementById('snowflakes'));
  }
}

function formatTimer(toFormat, isEndTimer) {
  function pad(val) {
    return val >= 10 ? val : ('0' + val);
  }
  
  const ms = toFormat % 1000;
  toFormat = (toFormat - ms) / 1000;
  const secs = toFormat % 60;
  toFormat = (toFormat - secs) / 60;
  const mins = toFormat % 60;
  
  // Output Minutes only if found, otherwise Seconds, and Milliseconds if asked with showMs
  return `${mins > 0 ? (pad(mins) + 'm:') : ''}${pad(secs)}s${isEndTimer ? ('.' + Math.round(ms)) + 'ms' : ''}`;
}

function chooseDestination() {
  const possibilities = [ 'The Grand Canyon', 'Snowy Cabin', 'Mount Everest', 'Family Ranch' ];
  return possibilities[randomRange(0, possibilities.length-1)];
}
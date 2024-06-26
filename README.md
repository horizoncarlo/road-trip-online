# Road Trip! - Online version
*The open road calls...the luggage is packed, the car is (mostly) fuelled up, the kids have scribbled on the road maps, and the theme park, scenic canyon, party town, museum, or whatever destination awaits! The game challenges you to travel to your destination while managing the fun (and fuel) of the trip, and maybe making a memory or two along the way.*

<a href="./images/example-game.jpg" target="_blank"><img style="width: 400px;" src="./images/example-game.jpg"/></a>

Road Trip! is an online version adapted from a physical tabletop dice placement game.

### Play At: https://road-trip-online.onrender.com/

You win if your Distance is 6 or higher.  
You lose if your Fuel or Fun is 0 or lower.

Each turn you roll 5 dice.  
You must reroll once - which can be a single die or any number of dice (as long as they are the same number). You can always reroll any Rest Stop ⚃ for free.

You can spend 2 Memories to reroll again or modify a die by +1/-1, as many times as you want if you have Memories to spend.

Then drag-and-drop the dice onto their matching slots. Note that if possible you have to place Route ⚀ + Travel ⚅ to get Distance.

Gain +1 Memory (up to a maximum of 6) for every pair of dice in a slot at the end of the turn.

When done, press End Turn to see how your resources changed, then start a new turn and keep driving.

## Print Rules
For more information on the game you can find the free rules at:  
https://horizongamesblog.wordpress.com/road-trip-2022/

## Setup
The app uses:
- [Alpine.js](https://alpinejs.dev/) for easier model binding
- [jQueryUI](https://jqueryui.com/) (of all things...) for simplifying drag-and-drop
- [Notyf](https://www.npmjs.com/package/notyf) as a light toast solution
- Otherwise plain vanilla HTML and JS

As a result you can play the game locally by visiting `index.html` in a web browser - no further setup needed

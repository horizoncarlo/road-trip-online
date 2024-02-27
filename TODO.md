# TODO
- BUG in Firefox rendering, dice is white if moused over while rolling - fine if wiggle-dice anim is removed

##### Timed Mode 
- * Do a timed mode, and show at the end of a win/loss (think this will be the most interesting addition compared to the tabletop version)

##### Backgrounds
- More variety of background pictures, plus randomly selecting them

##### Footer
- Show an animated little car driving as a pseudo-progress bar along the bottom of the page with a pixel road
  - Example cars: https://www.flaticon.com/free-animated-icons/car
  - Could be fun to randomize destinations (pull a list of cities in a country?)
  - Then put the city label at the end of the road (and on victory/loss screen)

##### Dialogs
- Replace jQuery UI dialogs with native/custom rolled, and remove jQuery UI CSS
- Do dialog width better, should be vw instead of %/px, with a max-width of px
- Make sure the dialogs are at a high enough z-index to not overlap any dragged dice
- Currently pressing Cancel on the initial How to Play dialog leaves the game in a bugged state as the game is never started
- Don't restart the turn/game on subsequent openings/acceptance of the How to Play dialog, just the initial load

##### Lost Dice improvement
- Let the user choose where EACH Lost dice applies, via radio buttons in the dialog. Submit buttons would be "Confirm", "All Fun", "All Fuel"
  - Also need to confirm if they will lose when choosing a certain option

##### Local Storage
- Do some more local storage - current game state is saved to prevent losing data on refresh? Save eventual customization options too
- Customize:
  - dice color (face, pip)
  - sort dice after roll or not
  - number of twirls (aka fast mode to have none)
- Rain and snow effects (from Fishing Day) as a random/configurable option?

#### Minor / daydream
- Snap draggable into dice placement slot
- Would be amazing to leverage the 3D even more and have visibly stacked dice in the same slot
- If someone loses on the first turn have an extra explanation of thematically what happens

#### Mobile
- Mobile MIGHT be okay, if we can debug why draggable doesn't work. jQuery handling of touch events?
  - * Can reproduce the issue on the mobile version of desktop debug, so that's helpful
  - https://github.com/furf/jquery-ui-touch-punch as a patch?
  - Otherwise hide Instructions and Travel Log entirely (or put them at the bottom)
  - Hide Inline Help entirely

#### Win/Loss Screen
- Polish the notify of loss/victory, with a prompt to play again, stats, art, etc. Could take a nod from Treasure Hunt and do a fullscreen overlay
- Put some driving animations here and there? Could be on victory screen? Randomize from a list? Give credit somehow?
https://www.reddit.com/r/PixelArt/comments/v9xyw7/night_drive/
https://www.reddit.com/r/saudiarabia/comments/11ty0nr/1211_am_pixel_art/
https://www.reddit.com/r/PixelArt/comments/cenu49/driving_animation_doodle_128_x_128_30_colors/
https://64.media.tumblr.com/486322ba78b854b64f56501bc675f164/tumblr_prerqrnkSE1uy5z3wo1_1280.gifv
https://i.pinimg.com/originals/09/cc/14/09cc14191586aa0c5bb8938672534f4f.gif

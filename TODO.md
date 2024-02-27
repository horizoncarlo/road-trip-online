- BUG in Firefox rendering, dice is white if moused over while rolling - fine if wiggle-dice anim is removed
- Better styling on the resources tracker - little gas tank that fills up, bigger smiling face, etc. Plus animations on change
- Better styling on the instructions panel on the left
- Style the dice tray like an actual wooden tray?
- Put the reroll/+1/-1 to the right of the dice, to regain some vertical space, as the game is annoying if it doesn't fit in a single page
  - Potentially force/downscale/redo the view to dynamically fit within 100% view height?
- Do a score changelog on the right side of the page? Shows fuel/fun/etc. modifiers after you press End turn. Ideally UI is clear enough to see what happened. Maybe leaves a +/-X below the resource bar until the next turn
- Do some more local storage - current game state is saved to prevent losing data on refresh? Save eventual customization options too. Save Inline Help toggle state
- Mark some of our local storage as expiring, such as whether they are new or not and should see the How to Play
- Get rid of setTimeout 100ms in endTurn after alert() are removed
- Could be fun to randomize destinations (pull a list of cities in a country?), and show a little car with a progress bar at the top of the page for Distance
- Better way to notify of loss/victory, with a prompt to play again, etc.
- Replace jQuery UI dialogs with native/custom rolled, and remove jQuery UI CSS
- Currently pressing Cancel on the How to Play dialog leaves the game in a bugged state as the game is never started
- Don't restart the turn/game on subsequent openings/acceptance of the How to Play dialog, just the initial load
- Clean up how the inline help is toggled (see toggleInlineHelp())
- Make sure the dialogs are at a high enough z-index to not overlap any dragged dice
- Let the user choose where EACH Lost dice applies, via radio buttons in the dialog. Submit buttons would be "Confirm", "All Fun", "All Fuel"
- Snap draggable into dice placement slot
- Would be amazing to leverage the 3D even more and have visibly stacked dice in the same slot
- If someone loses on the first turn have an extra explanation of thematically what happens
- Customize:
  - dice color (face, pip, border)
  - sort dice after roll or not
  - number of twirls (aka fast mode to have none)
  - start setup
- Do floating panels (header, instructions left, dice mid, roll log right) with random full page scenery picture backgrounds
- Do dialog width better, should be vw instead of %/px, with a max-width of px
- Mobile MIGHT be okay, if we can debug why draggable doesn't work. jQuery handling of touch events?
  - * Can reproduce the issue on the mobile version of desktop debug, so that's helpful
  - https://github.com/furf/jquery-ui-touch-punch as a patch?
- Eventually do an "auto-allocate" that places our dice for us? Since realistically when playing on tabletop an experienced player will often just do the scoring without physically placing
  - Or could just let End Turn button be pressed without fully drag and dropped dice? Basically work against allDice list instead of checking slots
- Put some driving animations here and there? Randomize from a list? Give credit somehow?
https://www.reddit.com/r/PixelArt/comments/v9xyw7/night_drive/
https://www.reddit.com/r/saudiarabia/comments/11ty0nr/1211_am_pixel_art/
https://www.reddit.com/r/PixelArt/comments/cenu49/driving_animation_doodle_128_x_128_30_colors/
https://64.media.tumblr.com/486322ba78b854b64f56501bc675f164/tumblr_prerqrnkSE1uy5z3wo1_1280.gifv
https://i.pinimg.com/originals/09/cc/14/09cc14191586aa0c5bb8938672534f4f.gif
https://images.squarespace-cdn.com/content/551a19f8e4b0e8322a93850a/1573861732601-PTWHSU2HW5BZ9C2IASCM/Intro_Parallax.gif?content-type=image%2Fgif
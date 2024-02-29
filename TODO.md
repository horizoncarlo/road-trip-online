# TODO
- BUG in Firefox rendering, dice is white if moused over while rolling - fine if wiggle-dice anim is removed

##### Footer
- Show an animated little car driving as a pseudo-progress bar along the bottom of the page with a pixel road
  - Example cars: https://www.flaticon.com/free-animated-icons/car
- Could be fun to randomize destinations (pull a list of cities in a country?)
  - Look at https://public.opendatasoft.com/
  - Then put the city label at the end of the road (and on victory/loss screen)

##### Local Storage
- Save game state to prevent losing data on refresh?
- Save a history of runs? Or personal best time?
  - Online scoreboard with a Bun/Node backing? TOTALLY wouldn't be hackable lol
- Save eventual customization options too:
  - dice color (face, pip)
  - sort dice after roll or not
  - number of twirls (aka fast mode to have none - can't turn off in a timed match, and timed matches have a set number of twirls)
  - background image or not
  - snow effects (from Fishing Day), random chance by default, but configurable too
    - Only bring in the related CSS if snow is actually falling

#### Minor / daydream
- Try wrapping in Electron or Tauri
- Snap draggable into dice placement slot
- If someone loses on the first turn have an extra explanation of thematically what happens?
- Would be amazing to leverage the 3D even more and have visibly stacked dice in the same slot
- Could also theme as a racing game, let the player choose roadtrip vs race at the start before launching
  - Different wallpapers and different terminoloy (Fun = Tires, Memories = Skill, Rest Stop = Pit Stop, etc.)
  - Could do goofy stuff like "you got in a crash" where the dice are scattered around the corners of the screen so they're harder to handle
  - Could have each Distance be a "lap", and you do a set number in a race, and it tracks your time for each lap and whether you finished. Since more likely to lose when rushing

#### Mobile
- Mobile MIGHT be okay, if we can debug why draggable doesn't work. jQuery handling of touch events?
  - * Can reproduce the issue on the mobile version of desktop debug, so that's helpful
  - https://github.com/furf/jquery-ui-touch-punch as a patch?
  - Otherwise hide Instructions and Travel Log entirely (or put them at the bottom)
  - Hide Inline Help entirely

- Put some driving animations here and there? Could be on victory screen? Randomize from a list? Give credit somehow?
https://www.reddit.com/r/PixelArt/comments/v9xyw7/night_drive/
https://www.reddit.com/r/saudiarabia/comments/11ty0nr/1211_am_pixel_art/
https://www.reddit.com/r/PixelArt/comments/cenu49/driving_animation_doodle_128_x_128_30_colors/
https://64.media.tumblr.com/486322ba78b854b64f56501bc675f164/tumblr_prerqrnkSE1uy5z3wo1_1280.gifv
https://i.pinimg.com/originals/09/cc/14/09cc14191586aa0c5bb8938672534f4f.gif
https://www.reddit.com/r/PixelArt/comments/sk014s/quiet_empty_street/
https://www.reddit.com/r/PixelArt/comments/ns8tv1/oc_accident/
https://www.reddit.com/r/perfectloops/comments/15xalrd/a_evening_city_view/

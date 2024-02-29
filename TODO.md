# TODO
- BUG in Firefox rendering, dice is white if moused over while rolling - fine if wiggle-dice anim is removed

##### Footer
- Show an animated little car driving as a pseudo-progress bar along the bottom of the page with a pixel road
- Could be fun to randomize destinations (pull a list of cities in a country?)
  - Look at https://public.opendatasoft.com/
  - Then put the city label at the end of the road (and on victory/loss screen)

##### Local Storage
- Save game state to prevent losing data on refresh?
- Save a history of runs? Or personal best time?
  - Online scoreboard with a Bun/Node backing? TOTALLY wouldn't be hackable lol

#### Minor / daydream
- Snap draggable into dice placement slot
- Would be amazing to leverage the 3D even more and have visibly stacked dice in the same slot
- Could also theme as a racing game, let the player choose roadtrip vs race at the start before launching
  - Different wallpapers and different terminoloy (Fun = Tires, Memories = Skill, Rest Stop = Pit Stop, etc.)
  - Could do goofy stuff like "you got in a crash" where the dice are scattered around the corners of the screen so they're harder to handle
  - Could have each Distance be a "lap", and you do a set number in a race, and it tracks your time for each lap and whether you finished. Since more likely to lose when rushing

#### Mobile
- Mobile MIGHT be okay, if we can debug why draggable doesn't work. jQuery handling of touch events?
  - * Can reproduce the issue on the mobile version of desktop debug, so that's helpful
  - https://github.com/furf/jquery-ui-touch-punch as a patch?
  - Otherwise hide Instructions/Options and Travel Log entirely (or put them at the bottom)
  - Hide Inline Help entirely

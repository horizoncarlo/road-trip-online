# TODO
- BUG in Firefox rendering, dice is white if moused over while rolling - fine if wiggle-dice anim is removed
- Make the resource maximums totally dynamic and backed by variables
  - For example going 12 Distance instead of 6. All related text/teaching should be dynamically updated to reflect
- Consider splitting up the mega main JS file, and probably CSS too
- Could be fun to randomize destinations. See `destination` var. Could be our own personal list, or pull a list of cities in a country?
  - Look at https://public.opendatasoft.com/

##### Footer
- Pixel road for the little car to drive along?
  - Although kind of neat just having the option to float it on the screen

##### Local Storage
- Save game state to prevent losing data on refresh?
- Save a history of runs? Or personal best time?
  - Online scoreboard with a Bun/Node backing? TOTALLY wouldn't be hackable lol

#### Mobile
- Mobile MIGHT be okay, if we can debug why draggable doesn't work. jQuery handling of touch events?
  - * Can reproduce the issue on the mobile version of desktop debug, so that's helpful
  - https://github.com/furf/jquery-ui-touch-punch as a patch?
  - Otherwise hide Instructions/Options and Travel Log entirely (or put them at the bottom)
  - Hide Inline Help entirely

#### Racing Theme
- Could also theme as a racing game, let the player choose roadtrip vs race at the start before launching
  - Different wallpapers and different terminoloy (Fun = Tires, Memories = Skill, Rest Stop = Pit Stop, etc.)
  - Could do goofy stuff like "you got in a crash" where the dice are scattered around the corners of the screen so they're harder to handle
  - Could have each Distance be a "lap", and you do a set number in a race, and it tracks your time for each lap and whether you finished. Since more likely to lose when rushing
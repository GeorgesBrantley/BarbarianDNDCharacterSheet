# Experiment Barbarian Field Sheet

A dependency-free local DND session helper for an Experiment Barbarian: HP, rage, attacks, stats, skills, inventory, potions, statuses, and categorized notes.

Open `index.html` directly in a browser, or host it locally from this folder:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

Your sheet saves automatically in the browser with `localStorage`. Use **Download Sheet** to download a JSON backup with the character name and timestamp in its filename. The file goes to your browser's download location (usually Downloads), or your browser may ask where to save it depending on your settings. Use Import to restore or move character data.

Keyboard shortcuts: press **1** for Character Sheet, **2** for Combat, or **3** for Notes. Shortcuts are inactive while typing in a field or holding modifier keys. Hover over a view button to see its shortcut.

Use **Timeline** in the second header row to review timestamped HP changes, resource use, rests, and note edits, grouped by day with newest events first. The timeline saves with your character and is included in downloads and imports; existing sheets start recording new changes without inventing past events. Return through Character Sheet, Combat, or Notes, or use their **1/2/3** shortcuts when you are not typing.

The floating quick bar stays attached to the bottom-left edge in every view. **Current HP** updates with your health; click it to open the top of Combat with your HP controls visible. **Rage** shows whether you are raging; click it to jump to the Rage tile in Combat. Use the bar's left arrow to collapse it into a small edge tab, then the right arrow to reopen it. Your sheet remembers whether the bar is collapsed.

Click the **☆** on an attack or inventory item to favorite it. Favorites appear in the quick bar with crossed swords for attacks and a bag for items. Hover over a favorite (or focus it with the keyboard) to read its details; click it to open and highlight its card, including hidden inventory items. Click **★** on the card to remove the favorite. Favorites save with your sheet and follow their cards when reordered. If the bar fills up, scroll it horizontally to reach more favorites.

Set an item's optional **Hotbar shorthand** in its expanded inventory card to use a shorter name in the quick bar. Leave it blank to use the full item name. Hover details still show the full name, and shorthand names save with your sheet.

## Ideas for future improvements

These are suggestions for future work, not currently available features.

### Features

1. **Attack and damage roller:** Roll directly from an attack card, with advantage, disadvantage, critical hits, and optional rage damage shown in a readable breakdown.
-- I like tactile rolling. No thanks
2. **Encounter tracker:** Track initiative, rounds, enemies, and timed conditions alongside the character's combat view.
-- This is DM stuff, I am a plyer
3. **Timeline session markers:** Extend the existing automatic timeline with named session boundaries and filters for individual sessions or event types.
-- Nah, my session notes is better than this
4. **Multiple character profiles:** Keep separate local sheets for different characters or campaigns, with a quick profile switcher and individual exports.
-- Nah. 
5. **Quest and NPC links:** Turn categorized notes into linked quest, location, and NPC entries with objectives, progress, and related loot.
-- Seems difficult to manage, nothanks

### Usability

1. **Pinned combat shortcuts:** Let players pin favorite attacks, potions, and abilities to a compact quick-access bar.
-- 
2. **Broader undo support:** Extend Undo Delete to cover accidental HP, inventory quantity, and resource changes, with a short description of the action being reversed.
-- No thats worse
3. **Clear save feedback:** Show when the sheet last saved locally and when it was last exported, with an optional reminder to make a backup.
-- Done
4. **More keyboard shortcuts:** Extend the existing 1/2/3 view shortcuts with shortcuts for global search and adjusting HP, while keeping shortcuts inactive when typing in fields.
-- Done
5. **Touch-friendly compact view:** Offer larger tap targets, collapsible secondary details, and a sticky HP/resource summary for phone use at the table.
-- This is on my local mac, no. 

### Visual polish and effects

1. **Animated serum vials:** Give each Experiment Rage Serum a distinct vial illustration with a fill level tied to its remaining uses and a brief activation effect.
-- eh, rage serum is shared. 
2. **Character portrait frame:** Add an optional local portrait with an ornamental frame that changes with the active rage serum or low HP.
-- Eh, don't want to do drawligs
3. **HP change effects:** Animate the health bar and briefly show damage or healing numbers so changes are easy to notice, with reduced-motion alternatives.
-- Nah
4. **Themed sheet skins:** Offer parchment, alchemist's notebook, and dark dungeon styles with consistent colors, borders, and readable contrast.
-- nah
5. **Illustrated status badges:** Give conditions recognizable icons and compact duration rings, with text labels and an expanded explanation on focus or tap.
-- Nah

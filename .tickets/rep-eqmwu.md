---
id: rep-eqmwu
status: closed
deps: []
links: []
created: 2026-11-18T21:01:09Z
type: feature
priority: 2
assignee: Stavros Korokithakis
---
# Show an install message in the lobby

Ready for implementation.

Objective: the lobby shows a small message that tells the player to install the game, until the player installs it or selects 'Not now'.

Scope: index.html only (lobby markup, a few CSS lines if needed, script).

Behaviour:
- The message is a block in the lobby below the 'Create game' actions: one line of text and a button row. It is hidden by default. It is never a pop-up and it never shows in a room. The lobby and a room are separate page loads (a room is ?room=CODE), so 'in the lobby' is fixed for each page load.
- Chromium path (Android and desktop): listen for 'beforeinstallprompt' on every page load, lobby or room. Always call preventDefault() so that the browser does not show its own install bar, and keep the event. If the page shows the lobby and the player did not dismiss the message, show it with the text 'Add Quarto to your home screen and open it like an app.' and the buttons 'Install' and 'Not now'. 'Install' calls prompt() on the kept event and then hides the message, whatever the player selects in the system dialog. A cancel in the system dialog does NOT count as 'Not now'.
- iOS path: iOS has no such event. If the page shows the lobby, the device is iOS, and the player did not dismiss the message, show it at once with the text 'To add Quarto to your home screen, tap Share, then Add to Home Screen.' and only the button 'Not now'. Detect iOS from the user agent (iPhone, iPad, iPod), plus iPadOS that reports itself as a Mac with touch points. Say in a comment that this is a guess and that in-app browsers will show the text although they cannot install.
- 'Not now' hides the message and stores the choice in localStorage under 'quarto.installDismissed', through the existing storage helpers (storage can be unavailable). A stored choice means the message never shows again.
- Never show the message when the page already runs as an installed app (display-mode standalone, or navigator.standalone on iOS). Hide it on the 'appinstalled' event.
- Other browsers (for example Firefox on Android) show nothing.

Look: the design file has no frame for this. Use the existing text and button classes (.muted, .button, .button-quiet, .button-row) and the existing spacing tokens. Light and dark themes must both look correct. Use the three strings exactly as written above.

Non-goals: no pop-up or dialog, no message in a room, no service worker, no 'Join game' field, no analytics, no change to manifest or icons, no edits to misc/Quarto.html, no new test file.

## Design

Chrome fires beforeinstallprompt only after one tap and 30 seconds on the site in total, so on Android the message can appear late or only on a later lobby visit. This is accepted. The page always calls preventDefault so that the lobby message is the only install promotion and a player who selected 'Not now' does not get the browser bar in its place. Lobby only: on iOS an installed app has its own storage, so an install from inside a room would lose that room.

## Acceptance Criteria

A real beforeinstallprompt is hard to get in a test browser; a synthetic event with a fake prompt() is an acceptable check. Verify: message hidden by default; shown in the lobby and not in a room after the event; 'Not now' survives a reload; iOS text shows with an iPhone user agent; nothing shows in standalone display mode. node --test passes.


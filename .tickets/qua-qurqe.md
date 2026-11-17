---
id: qua-qurqe
status: closed
deps: []
links: []
created: 2026-11-17T19:42:55Z
type: feature
priority: 2
assignee: Stavros Korokithakis
---
# Replace Figtree with Commissioner

Objective: Commissioner becomes the only typeface of the page, for Latin and Greek text. Figtree goes away completely. Reason from the designer and the project owner: Figtree has no Greek letters, and players type their names in Greek.

Scope:
- Font files: Commissioner as a variable font, weights 400 to 700, subsets Latin, extended Latin and Greek, as WOFF2 in `fonts/`. Source: the Google Fonts CSS for `Commissioner:wght@400..700` lists one WOFF2 URL and one unicode range per subset (request it with a browser User-Agent to get WOFF2). Download the three files; the page must host them itself and make no request to another host.
- `@font-face` rules with the unicode range of each subset, so the browser loads the Greek file only when Greek text is on the page.
- Replace the font family in the type tokens. Fallback stays system-ui. Sizes, weights and line heights do not change.
- Remove the two Figtree files. Replace `fonts/OFL.txt` with the licence of Commissioner: copyright line "Copyright 2019 The Commissioner Project Authors (https://github.com/kosbarts/Commissioner)" and the SIL Open Font License 1.1 text (the file `ofl/commissioner/OFL.txt` in the google/fonts repository has both).
- Add a short comment at the `@font-face` rules: the design frames in `misc/Quarto.html` show Figtree; the designer later chose Commissioner because Figtree has no Greek, so text widths differ from the frames on purpose.

Caveat: Commissioner has other letter widths than Figtree. Check every screen for text that now wraps, clips or overflows, in particular at 360px wide with a 32 character name: name chips, status block, notices, buttons, room line, waiting room. Fix layout problems with the smallest change; do not change type sizes without asking.

Non-goals: Cyrillic, Vietnamese or polytonic Greek subsets; a change of type sizes or weights; any change to rules, seats or sync.

## Acceptance Criteria

A Greek name and Greek-Latin mixed name show in Commissioner (not in a system font) on the chips and in the status text. Latin text shows in Commissioner. The network log shows font requests only to the page's own host, and no Figtree file remains in the repository. No text clips or overflows at 360px, 390px, 768px, 1024px and 1280px.


## Notes

**2026-11-17T19:44:38Z**

ready for implementation

Change of plan: the designer delivered a new version of `misc/Quarto.html` that uses Commissioner in every frame. It is identical to the earlier version in all sizes, colours and layout; only the typeface differs. So this ticket no longer waits for the game screen. Do it first, and compare all screens against the new frames.

Changes to the scope above:
- Source of the font files: the design bundle, not Google Fonts. Unpacked copies are in `/tmp/opencode/quarto-design3/assets/`: `5f07c0402e.woff2` (Latin), `86f28cb70c.woff2` (extended Latin), `2b8517a01a.woff2` (Greek). The unicode range of each one is in the `@font-face` rules of any page under `/tmp/opencode/quarto-design3/pages/`. The bundle also holds Cyrillic and Vietnamese files; do not add those.
- The comment at the `@font-face` rules is no longer needed, because the frames now show Commissioner. Leave it out.
- The caveat about other letter widths still applies to long names at 360px, but the frames are now the reference for line breaks.
- The unpacked copy of the new design is `/tmp/opencode/quarto-design3/` (`pretty/`, `text/`, `pages/`, `assets/`). Stop using `/tmp/opencode/quarto-design2/`.

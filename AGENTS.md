# Agent notes

## Design

`misc/Quarto.html` is the canonical design for the page. Build the UI from it.

When the owner gives you a new design file, replace `misc/Quarto.html` with it
in the same change, before you implement anything from it. Always keep this
file up to date.

The file is a packed export. The root page holds a JSON manifest (base64,
gzip) of nested pages, and each nested page is again a manifest plus a
template. Unpack both levels to read the frames.

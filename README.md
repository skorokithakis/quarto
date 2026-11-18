# Quarto

## Play now: [quarto.stavros.io](https://quarto.stavros.io)

Quarto is a board game for two players. Open the link, select **Create game**,
and send the room link to a friend. Each of you plays on your own device. There
is nothing to install and no account to make. You can add it to the home screen
of your phone and open it like an app.

## For developers

The game is a static web page with no build step and no packages.

- Run it: serve this directory over HTTP, for example
  `python3 -m http.server`, and open the address in a browser.
- Test the rules: `node --test`.

The two players sync through [Gweet](https://github.com/skorokithakis/gweet).

## Licence

[GNU Affero General Public License v3.0](LICENSE)

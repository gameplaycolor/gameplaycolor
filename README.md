Game Play Color
===============

A JavaScript Game Boy Color emulator for iOS, based on the [GameBoy-Online](https://github.com/taisel/GameBoy-Online) emulator core.

If you just want to play Game Play Color, you can find it online at [https://gameplaycolor.com](https://gameplaycolor.com).

Dependencies
------------

Check out the project, update the submodules, install the brew-based dependencies, and install the additional Python dependencies:

```bash
git clone git@github.com:jbmorley/gameplay.git
cd gameplay
git submodule update --init --recursive
cat brew.txt | xargs brew install
pip install --user -r requirements.txt
```

Building
--------

Game Play Color is built using a custom Python build script which inlines and minifies HTML, CSS and JavaScript, and binds in the settings for a given deployment.

For example, building the release version of Game Play Color as hosted on [gameplaycolor.com](https://gameplaycolor.com) can be done by running the following command from the root of the repository:

```bash
scripts/build build settings/release.json
```

The build will be created in the `build` directory, and a corresponding *.tar.gz will be creatd in `archives`, tagged with the git sha and settings name (e.g., `build-168bd9d0d8d309a1efb1983bd61ec34ff22951b5-release.tar.gz`).

Changelog
---------

### Version 2.3.6

- Improving the first run messaging.

### Version 2.3.5

- Fixing the icon on the sign in page.

### Version 2.3.4

- Fixing some crashes.

### Version 2.3.3

- Re-enable crash reporting.
- Bug fixes.

### Version 2.3.2

- Fixing a small bug in artwork lookup.
- Minor improvements to logging.

### Version 2.3.1

- Adding a mechanism to email logs.

### Version 2.3.0

- New improved game library.

### Version 2.2.3

- Catching up to upstream GameBoy-Online.
- Some UI improvements.

### Version 2.2.2

- Don't animate the console when restoring games.
- Temporarily disabling button animations to improve audio performance.

### Version 2.2.1

- New in-game menu.
- Menu option for resetting the current game.
- Menu option for Zelda fans: A + B + Select + Start.

### Version 2.2.0

- Support for diagonal directions using the d-pad.
- Improved scrolling in the game library.

### Version 2.1.7

- Setting for console color.
- Work-around for audio playback issues on iPhone 6.

### Version 2.1.6

- Adding support for different emulation speeds.

### Version 2.1.5

- Adding scrolling to the settings dialog on small screens.
- Adding the version to the settings dialog.

### Version 2.1.4

- Moving the account sign out and 'Say Thanks' into a new settings dialog.
- Adding the option to disable sound; use this to listen to your own music!

### Version 2.1.3

- Fixing early Google Drive session expiry.
- Minor UI tweaks.

### Version 2.0.13

- Show release notes when informing users about updates.
- Only display errors if no update is available.

### Version 2.0.12

- Improving guards against loading corrupt ROMs.

### Version 2.0.11

- Correcting the characters used on the d-pad and in the 'Say Thanks' link on iOS 8.3.

### Version 2.0.10

- Adding the application version, screen size and user agent string into the logs.

### Version 2.0.9

- Improved logging.
- Better error handling of missing ROMs.

### Version 2.0.8

- Improving information available in crash log emails.
- Fixing some bugs which resulted in an attmept to play and save ROMs that had failed to download.
- Introduced a recovery mechanism for the above scenario.
- Improved debugging tools.

### Version 2.0.7

- Layout support for iPhone 4 and 4S.

### Version 2.0.6

- Changing the default error handler to ignore errors from cross-origin scripts.

### Version 2.0.5

- Fixed crash when inspecting Google Drive files with no extension.
- Preventing application from running if the user cancels database creation.
- Fixed crash when Google Drive returned an empty response.
- Fixed crash due to incorrectly named logging call.

### Version 2.0.0

- Initial release of Game Play Color.

### Version 1.0.0

- Initial release of Game Play.

Thanks
------

Many thanks to:

- [Grant Galitz](https://github.com/taisel) for the [GameBoy-Online](https://github.com/taisel/GameBoy-Online) emulator and core.
- [Pedro Ladaria](http://www.codebase.es/) for writing the JSGB core.
- [David McLeod](http://twitter.com/Mucx) for graphical inspiration on [Dribbble](http://dribbble.com/mucx) and for letting me know about MicrogrammaD-MediExte.
- [Paul Ledger](http://www.flexicoder.com) for suggesting the name 'Game Play'.
- [Pavlos Vinieratos](https://github.com/pvinis) for help and suggestions testing early builds.

Legal
-----

1. Game Boy and Game Boy Color are trademarks of Nintendo Co., Ltd.. All rights reserved.
2. Downloading copied ROMs is illegal: only use images you have created from ROMs you own yourself.
3. InSeven Limited is an independent software company and is in no way affiliated with Nintendo Co., Ltd..

License
-------

Game Play Color contains code licensed under the GPL and MIT licenses. See [LICENSE.md](LICENSE.md) for more details.

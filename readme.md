# Game Play

A JavaScript Game Boy emulator for iPhone 5, based on the [JSGB](http://www.codebase.es/jsgb/) emulator core.

If you just want to play Game Play, you can find it online at [http://inseven.co.uk/apps/gameplay](http://inseven.co.uk/apps/gameplay).

## Screenshots

![Console](http://inseven.co.uk/images/gameplay/console.png)
![Games](http://inseven.co.uk/images/gameplay/games.png)

## Roadmap

### Remaining Issues

1. Change the name to Game Play
2. Improved icon
3. Host at an appropriate website
4. Set up a new Google API for inseven.co.uk.
5. Consider a donate button?
6. JSGB?

### Future Work

1. **Audio support** - The GameBoy-Online (https://github.com/grantgalitz/GameBoy-Online) core has already been integrated on the 'gameboy-online' branch but performance seems quite poor.
2. **Performance Improvements** - The existing JSGB core doesn't make use of JavaScript typed arrays so this might improve performance.
3. **Background saving** - There already exists some (disabled) code which uses a HTML5 database to save the game state.  This mostly works, but currently introduces a significant slow-down whenever saving the state; ideally games would only be saved on a background event but this doesn't appear to be present in Mobile Safari.
4. **Improved sign-in** - It is currently necessary to relaunch the application after authenticating with Google; it would be great to fix this.

## Fonts

The graphics make use of the following fonts:

- [G.B.Boot](http://www.dafont.com/gb-boot.font)
- [Gamegirl Classic](http://www.fontspace.com/freaky-fonts/gamegirl-classic)
- [MicrogrammaD-MediExte](http://www.fontslog.com/microgrammad-mediexte-otf-23838.htm)

## License

- **Game Play** is licensed under the (GPL v2)[1].
- **JSGB** is licensed under the (GPL)[2].
- **GameBoy-Online** (included in the 'gameboy-online' branch) is licensed under the (GPL v2)[1].

If I have failed to correctly acknowledge any code, please let me know and I will update the relevat documentation.

## Thanks

- [Pedro Ladaria](http://www.codebase.es/) for writing the JSGB core.
- [David McLeod](http://twitter.com/Mucx) for graphical inspiration on [Dribbble](http://dribbble.com/mucx) and for letting me know about MicrogrammaD-MediExte.
- [Paul Ledger](http://www.flexicoder.com) for suggesting the name 'Game Play'.

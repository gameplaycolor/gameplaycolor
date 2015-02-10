# Game Play Color

A JavaScript Game Boy Color emulator for iPhone 5, based on the [JSGB](http://www.codebase.es/jsgb/) emulator core.

If you just want to play Game Play Color, you can find it online at [http://inseven.co.uk/apps/gameplay](http://inseven.co.uk/apps/gameplay).

## Screenshots

![Console](http://inseven.co.uk/images/gameplay/console.png)
![Games](http://inseven.co.uk/images/gameplay/games.png)

## Roadmap

### Future Work

1. **Background saving** - There already exists some (disabled) code which uses a HTML5 database to save the game state.  This mostly works, but currently introduces a significant slow-down whenever saving the state; ideally games would only be saved on a background event but this doesn't appear to be present in Mobile Safari.
2. **Improved sign-in** - It is currently necessary to relaunch the application after authenticating with Google; it would be great to fix this.

## Thanks

- [Pedro Ladaria](http://www.codebase.es/) for writing the JSGB core.
- [David McLeod](http://twitter.com/Mucx) for graphical inspiration on [Dribbble](http://dribbble.com/mucx) and for letting me know about MicrogrammaD-MediExte.
- [Paul Ledger](http://www.flexicoder.com) for suggesting the name 'Game Play'.

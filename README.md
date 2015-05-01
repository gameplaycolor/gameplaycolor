Game Play Color
===============

A JavaScript Game Boy Color emulator for iOS, based on the [GameBoy-Online](https://github.com/grantgalitz/GameBoy-Online) emulator core.

If you just want to play Game Play Color, you can find it online at [https://gameplaycolor.com](https://gameplaycolor.com).

Changelog
---------

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

- [Grant Galitz](https://github.com/grantgalitz) for the GameBoy-Online emulator and core.
- [Pedro Ladaria](http://www.codebase.es/) for writing the JSGB core.
- [David McLeod](http://twitter.com/Mucx) for graphical inspiration on [Dribbble](http://dribbble.com/mucx) and for letting me know about MicrogrammaD-MediExte.
- [Paul Ledger](http://www.flexicoder.com) for suggesting the name 'Game Play'.

Legal
-----

1. Game Boy and Game Boy Color are trademarks of Nintendo Co., Ltd.. All rights reserved.
2. Downloading copied ROMs is illegal: only use images you have created from ROMs you own yourself.
3. InSeven Limited is an independent software company and is in no way affiliated with Nintendo Co., Ltd..

License
-------

Game Play Color contains code licensed under the GPL and MIT licenses. See [LICENSE.md](LICENSE.md) for more details.

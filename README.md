# Game Play Color

[![Build](https://github.com/gameplaycolor/gameplaycolor/actions/workflows/main.yml/badge.svg)](https://github.com/gameplaycolor/gameplaycolor/actions/workflows/main.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/6b57f8f0-fdc2-4372-a0ad-d7c8cb35f612/deploy-status)](https://app.netlify.com/sites/gameplaycolor/deploys)

A JavaScript Game Boy and Game Boy Color emulator for iOS, based on the [GameBoy-Online](https://github.com/taisel/GameBoy-Online) emulator core.

If you just want to play Game Play, you can find it online at [https://gameplaycolor.com](https://gameplaycolor.com).

## Dependencies

Check out the project, update the submodules, install the brew-based dependencies, and install the additional Python dependencies:

```bash
git clone git@github.com:gameplaycolor/gameplaycolor.git
cd gameplaycolor
git submodule update --init --recursive
scripts/install-dependencies.sh
```

It may be necessary to install pipenv as follows:

```bash
pip3 install pipenv
```

## Building

Game Play is built using a custom Python build script which inlines and minifies HTML, CSS and JavaScript, and binds in the settings for a given deployment.

For example, building the release version of Game Play as hosted on [gameplaycolor.com](https://gameplaycolor.com) can be done by running the following command from the root of the repository:

```bash
scripts/gameplay build settings/release.json
```

The build will be created in the `build` directory, and a corresponding *.tar.gz will be created in `archives`, tagged with the git sha and settings name (e.g., `build-168bd9d0d8d309a1efb1983bd61ec34ff22951b5-release.tar.gz`).

## Changelog

- [Changelog](https://gameplaycolor.com/changelog/)

## Thanks

Many thanks to:

- [Grant Galitz](https://github.com/taisel) for the [GameBoy-Online](https://github.com/taisel/GameBoy-Online) emulator and core.
- [Pedro Ladaria](http://www.codebase.es/) for writing the JSGB core which served as inspiration for the first version of Game Play.
- [David McLeod](http://twitter.com/Mucx) for graphical inspiration on [Dribbble](http://dribbble.com/mucx) and for letting me know about MicrogrammaD-MediExte.
- [Paul Ledger](http://www.flexicoder.com) for suggesting the name 'Game Play'.
- [Pavlos Vinieratos](https://github.com/pvinis) for help and suggestions testing early builds.

## Legal

1. Game Boy and Game Boy Color are trademarks of Nintendo Co., Ltd.. All rights reserved.
2. Downloading copied ROMs is illegal: only use images you have created from ROMs you own yourself.
3. InSeven Limited is an independent software company and is in no way affiliated with Nintendo Co., Ltd..

## License

Game Play and its [dependencies](#third-party-sources) are licensed under the MIT license. See [LICENSE](LICENSE) for more details.

### Third Party Sources

Game Play includes the following third party sources:

- **jQuery** - Copyright (C) 2013 jQuery Foundation and other contributors
- **GameBoy-Online** - Copyright (C) 2010-2016 Grant Galitz

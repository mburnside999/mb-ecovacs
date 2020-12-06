![Logo](ecovacs-deebot.png)

# ecovacs-deebot.js

[![npm](http://img.shields.io/npm/v/ecovacs-deebot.svg)](https://www.npmjs.com/package/ecovacs-deebot)
[![npm](https://img.shields.io/npm/dm/ecovacs-deebot.svg)](https://www.npmjs.com/package/ecovacs-deebot)
[![npm](https://img.shields.io/npm/dt/ecovacs-deebot.svg)](https://www.npmjs.com/package/ecovacs-deebot)
[![Travis-CI](https://travis-ci.org/mrbungle64/ecovacs-deebot.js.svg?branch=master)](https://travis-ci.org/mrbungle64/ecovacs-deebot.js)

A Node.js library for running Ecovacs Deebot vacuum cleaner robots.

## Installation

This library uses the canvas library which might require additional installations.
For the full functional range please install the following packages.

For Debian-based Linux systems the following commands should be executed:
```bash
sudo apt-get update
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```
A reboot might be necessary before executing the next command
```bash
sudo npm install canvas --unsafe-perm=true
```
For instructions for other systems visit https://www.npmjs.com/package/canvas#compiling

Afterwards you can install the library with
```bash
npm install ecovacs-deebot
```

## Usage

Information on how to use this library can be found [here](https://github.com/mrbungle64/ecovacs-deebot.js/wiki).

## Models

### Supported models
* Deebot 900/901
* Deebot Ozmo 920
* Deebot Ozmo 930
* Deebot Ozmo 950

### These models are known to work
* Deebot Slim 2
* Deebot N79
* Deebot 600/601
* Deebot 710/711
* Deebot U2
* Deebot Ozmo 610
* Deebot Ozmo 900
* Deebot Ozmo T8/T8+
* Deebot Ozmo T8 AIVI
* Deebot Ozmo Slim 10

### These models should work
* Deebot M88
* Deebot 605
* Deebot U2 Pro/Power

## Known issues

* There's a strange behavior of the battery value on Deebot 900/901. It's very likely that this is a firmware bug
* "pause" does not work with Deebot 710/711
* "stop" does not work with Deebot 711s

## Changelog

### 0.5.1 (alpha)
* Initial support for Deebot U2 series
* Improved support for T8 models
* Improved handling of device classes
* (boriswerner) Fixed cleaning log for 950 type models
* (boriswerner) VirtualBoundaries handling

### 0.5.0
* Lots of code refactoring
* Fix problem running multiple devices
* Added support for more Ozmo T8 models

### 0.4.24 - 0.4.26
* Bugfix releases

### 0.4.23
* Added support for Ozmo T8+

### 0.4.22
* (boriswerner) Added new spotAreaNames (950 type)

### 0.4.21
* Update some dependencies
* Bugfix for Ozmo T8 (without AIVI)

### 0.4.20
* Removed canvas from dependencies

### 0.4.19
* Added support for Ozmo T8 (without AIVI)

### 0.4.18
* Update dependencies
* ResetLifeSpan and SetLifeSpan (non Ozmo 950)

### 0.4.17
* Several enhancements and fixes. Especially for N79S/SE and N79T/W

### 0.4.16
* Bugfix release

### 0.4.14 - 0.4.15
* Added support for Ozmo T8 AIVI

### 0.4.13
* (boriswerner) Emit error on missing cleanlog (Ozmo 920/950)

### 0.4.12
* (boriswerner) Control which API call is used for lastCleanMap & timestamp (Ozmo 920/950)

### 0.4.11
* Several enhancements and fixes

### 0.4.6 - 0.4.10
* Implemented cleaning logs
* Several enhancements and fixes

### 0.4.5
* (nicoduj) Fixed `Failure code 0002` error
* Implemented move commands
* Some work on implementation of handling cleanLogs
* Several enhancements and fixes

### 0.4.4
* Added support for Ozmo 920

### 0.4.1 - 0.4.3
* Added map/spotArea template and functionality for Ozmo 930 and Deebot 900/901
* Improved handling command response and MQTT messages
* Several enhancements and fixes

### 0.4.0
* (boriswerner) Added map/spotArea template and functionality
* (boriswerner) Added enhanced map/spotArea functionality for Ozmo 950

### 0.0.2 - 0.3.9
* [Changelog archive](https://github.com/mrbungle64/ecovacs-deebot.js/wiki/Changelog-(archive)#039)

## Thanks and credits

* @joostth ([sucks.js](https://github.com/joostth/sucks.js))
* @wpietri ([sucks](https://github.com/wpietri/sucks))
* @bmartin5692 ([sucks](https://github.com/bmartin5692/sucks), [bumber](https://github.com/bmartin5692/bumper))
* @Ligio ([ozmo](https://github.com/Ligio/ozmo))
* @And3rsL ([Deebotozmo](https://github.com/And3rsL/Deebotozmo))

All credits for originally figuring out and documenting the protocol go to [@wpietri](https://github.com/wpietri).
He documented his [findings on the protocol](http://github.com/wpietri/sucks/blob/master/protocol.md) in his repository.

## Disclaimer

I am in no way affiliated with ECOVACS.

## License

GNU GENERAL PUBLIC LICENSE

Copyright (c) 2020 Sascha Hölzel <mrb1232@posteo.de>

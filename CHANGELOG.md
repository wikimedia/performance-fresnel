
0.5.0 / 2019-10-21
==================

### Added
* compute: Add diffMannWhitney(). (Timo Tijhof)

### Changed
* compute: Rename compareStdev() to diffStdev(). (Timo Tijhof)
* reports: Switch paint timing judgement from Stdev to Mann-Whitney. (Timo Tijhof)
* reports: Raise threshold for bytes transfers from 1B to 3B. (Timo Tijhof)
* build: Update js-yaml and puppeteer (Chromium 77). (Timo Tijhof)

0.4.0 / 2019-07-25
==================

### Changed

* navtiming,paint: Raise thresholds to +100ms and +10ms. (Timo Tijhof)
* transfer: Shorten 'pageWeight' metric description. (Timo Tijhof)

### Fixed

* build: Bump dev dependencies that have npm-audit warnings.

0.3.0 / 2019-05-28
==================

### Added

* compute: Add Mann-Whitney U test to compute module. (Thalia)
* printer: Merge scenarios into one table each. (James D. Forrester)

0.2.2 / 2019-04-01
==================

### Fixed

* New test release with updated dependencies throught npm audit fix (updating js-yaml).

0.2.1 / 2019-03-02
==================

### Added

* conductor: Support plain objects in `config.scenarios`.

0.2.0 / 2019-02-22
==================

### Added

* printer: Add formatting of bytes.
* cli: Validate params before reading config.

### Fixed

* printer: Fix formatting of near-zero negative values.

0.1.1 / 2019-01-15
==================

### Fixed

* build: Include `bin/` in the npm package.

0.1.0 / 2019-01-14
==================

* initial release. (Timo Tijhof)

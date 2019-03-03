[![Build Status](https://travis-ci.com/wikimedia/fresnel.svg?branch=master)](https://travis-ci.com/wikimedia/fresnel) [![npm](https://img.shields.io/npm/v/fresnel.svg)](https://www.npmjs.com/package/fresnel)

# Fresnel

Fresnel is an automated tool for creating and comparing
performance reports about web pages.


## Getting started

Install Fresnel from [npm](https://www.npmjs.com/package/fresnel). [Node.js](https://nodejs.org/) 10 or later is required.

```
$ npm install -g fresnel
```

## Configure scenarios

Fresnel reads configuration from a `.fresnel.yml` file. This is also the
place to declare your performance scenarios.

A scenario consists of the following options:

* url: The browser will navigate to this url.
* viewport (optional): Viewport for the browser tab.

  This does not include the OS or browser UI. For example, a maximised
  window on a 1440x900 screen could have a viewport of 1440x790.

  Default: `{ width: 1100, height: 700 }`

  For additional viewport properties, see [puppeteer/Page.setViewport](https://pptr.dev/#?product=Puppeteer&version=v1.11.0&show=api-pagesetviewportviewport).
* reports: List of Fresnel reports to enable for this scenario.

  Available:
  - [`navtiming`](./API.md#module_reports/navtiming)
  - [`paint`](./API.md#module_reports/paint)
  - [`transfer`](./API.md#module_reports/transfer)
* probes: List of Fresnel probes to enable for this scenario.

  Available:
  - [`screenshot`](./API.md#module_probes/screenshot)
  - [`trace`](./API.md#module_probes/trace)

Examples of Fresnel config files:
* [Fresnel test fixture](./test/fixtures/basic/.fresnel.yml)
* [MediaWiki](https://github.com/wikimedia/mediawiki/blob/master/.fresnel.yml)


## Usage

Run `fresnel help` to find the available commands and how to use them.

To record scenarios with Fresnel, run the `fresnel record` command.

Then, after changing the project under test, record the scenarios again.
This time, with a different label.

Lastly, compare the two recordings using `fresnel compare`.

```
$ fresnel record "before"

$ fresnel record "after"

$ fresnel compare "before" "after"
```

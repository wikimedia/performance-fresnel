< [README](./README.md)

**Fresnel** is an automated tool for creating and comparing
performance reports about web pages.

## Modules

<dl>
<dt><a href="#module_cli">cli</a></dt>
<dd><p>The command-line interface for Fresnel.</p>
<p>This module is invoked by <code>bin/fresnel</code> and is in charge of reading user
input such as CLI parameters, environment variables, and the <code>.fresnel.yml</code>
config file.</p>
<p>Interacts with: <a href="#module_conductor">conductor</a>.</p>
</dd>
<dt><a href="#module_compute">compute</a></dt>
<dd><p>Functions to help with numerical computations.</p>
</dd>
<dt><a href="#module_conductor">conductor</a></dt>
<dd><p>The program interface for Fresnel commands.</p>
<p>Interacts with: <a href="https://pptr.dev/#?product=Puppeteer&amp;version=v1.11.0&amp;show=api-class-browser">puppeteer/Browser</a>,
<a href="#Writer">Writer</a>, <a href="#Probe">Probe</a>, and <a href="#Report">Report</a>.</p>
</dd>
<dt><a href="#module_printer">printer</a></dt>
<dd><p>The text printer for the Fresnel command-line interface.</p>
<p>This module is invoked by <a href="#module_cli">cli</a> to turn information from
<a href="#module_conductor">conductor</a> into lines of text.</p>
</dd>
<dt><a href="#module_probes/navtiming">probes/navtiming</a></dt>
<dd><p>Get data from the Navigation Timing API in the browser.</p>
</dd>
<dt><a href="#module_probes/paint">probes/paint</a></dt>
<dd><p>Get data from the Paint Timing API in the browser.</p>
</dd>
<dt><a href="#module_probes/screenshot">probes/screenshot</a></dt>
<dd><p>Capture a screenshot from the browser viewport after the
page has finished loading.</p>
</dd>
<dt><a href="#module_probes/trace">probes/trace</a></dt>
<dd><p>Capture a trace file that can later be opened in Chrome DevTools
or <a href="https://chromedevtools.github.io/timeline-viewer/">timeline-viewer</a>.</p>
</dd>
<dt><a href="#module_probes/transfer">probes/transfer</a></dt>
<dd><p>Get data from the Resource Timing API in the browser.</p>
</dd>
<dt><a href="#module_reports/navtiming">reports/navtiming</a></dt>
<dd><p>Report on Navigation Timing API metrics.</p>
</dd>
<dt><a href="#module_reports/paint">reports/paint</a></dt>
<dd><p>Report on Paint Timing API metrics.</p>
</dd>
<dt><a href="#module_reports/transfer">reports/transfer</a></dt>
<dd><p>Report with transfer sizes from the Resource Timing API.</p>
</dd>
</dl>

## Classes

<dl>
<dt><a href="#Writer">Writer</a></dt>
<dd><p>Represents a directory and an (optional) prefix for files and
subdirectories created within it.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Probe">Probe</a> : <code>Object</code></dt>
<dd><p>A probe is a set of callbacks to run client-side when <a href="#module_conductor..record">recording</a>
scenarios.</p>
<h4 id="probebefore">probe.before</h4>
<p>The <code>before</code> callback runs before the web page starts loading. Use this to make changes to the
browser tab (via <a href="https://pptr.dev/#?product=Puppeteer&amp;version=v1.11.0&amp;show=api-class-page">puppeteer/Page</a>, or higher-level objects accessed via that,
such as <a href="https://pptr.dev/#?product=Puppeteer&amp;version=v1.11.0&amp;show=api-class-browser">puppeteer/Browser</a>). Examples of things one might do here:
set the viewport, start timeline tracing, disable JavaScript, grant permission for Geo location,
simulate a certain GPS position, etc.</p>
<p>Parameters:</p>
<ul>
<li><a href="https://pptr.dev/#?product=Puppeteer&amp;version=v1.11.0&amp;show=api-class-page">puppeteer/Page</a> <code>page</code>: The browser tab.</li>
<li><a href="#Writer">Writer</a> <code>writer</code>: Use this to obtain file paths to write
artefacts to.</li>
</ul>
<h4 id="probeafter">probe.after</h4>
<p>The <code>after</code> callback runs once the web page has finished loading. Use this to capture your
data. Typically by using <code>page.evaluate()</code> to send JavaScript code to the browser which will be
executed client-side in the context of the page. From there, you can access the DOM, other
web platform APIs, as well as any custom JavaScript interfaces exposed by code from the
web page itself.</p>
<p>Parameters:</p>
<ul>
<li><a href="https://pptr.dev/#?product=Puppeteer&amp;version=v1.11.0&amp;show=api-class-page">puppeteer/Page</a> <code>page</code>: The browser tab.</li>
<li><a href="#Writer">Writer</a> <code>writer</code>: Use this to obtain file paths to write artefacts to.</li>
<li>Function <code>addData</code>: Use this to store key/value pairs that should be
saved as part of the Fresnel record. These must be serialisable as JSON.</li>
</ul>
</dd>
<dt><a href="#Report">Report</a> : <code>Object</code></dt>
<dd><p>A report analyses data from a <a href="#Probe">Probe</a> when <a href="#module_conductor..record">recording</a>
and <a href="#module_conductor..compare">comparing</a> scenario data.</p>
<pre><code>const compute = require( &#39;fresnel/src/compute&#39; );
module.exports = {
    probes: [ &#39;x&#39; ],
    metrics: {
        example: {
            caption: &#39;An example metric.&#39;
            unit: &#39;ms&#39;,
            analyse: ( series ) =&gt; compute.stats( series.x.mykey ),
            compare: ( a, b ) =&gt; compute.diffStdev( a, b )
        }
    }
};</code></pre><h4 id="reportprobes">report.probes</h4>
<p>Specify one or probes that provide the data needed for this report. The recording phase
uses this to determine which probes to run.</p>
<h4 id="reportmetrics">report.metrics</h4>
<p>An object with one or more metric specifications. The key is the internal
name for the metric, and the value is an object with the following properties:</p>
<ul>
<li>string <code>caption</code> - A short description of this metric.</li>
<li>string <code>unit</code> - The unit for this metric.
Must be one of: <code>ms</code>, or <code>B</code>.</li>
<li>Function <code>analyse</code> - A callback to aggregate and analyse data from thes probes,
as gathered from multiple runs.</li>
<li>Function <code>compare</code> - A callback to compare the two sets of analysed data, from
two recordings.</li>
<li>number <code>threshold</code> (optional) - If the compared difference is more than this
value, a warning will be shown.</li>
</ul>
<h3 id="metricanalyse-callback">metric.analyse callback</h3>
<p>During each run of the same scenario, a probe can capture data into an object.
Here, the values from those objects have combined from each run into an array.</p>
<p>The analyser for a single metric, has access to all data from probes, and
must return an object with a <code>mean</code> and <code>stdev</code> property. This simplest
way to do that to pass a series to <a href="#module_compute..stats">compute.stats</a>
and return its result.</p>
<p>For example, if probe <code>x</code> collects <code>{ mykey: 10 }</code> and <code>{ mykey: 12 }</code> from
two runs of the same scenario, it will be available here as <code>series.x.mykey</code>
containing <code>[ 10, 12 ]</code>.</p>
<p><strong>Parameters</strong>:</p>
<ul>
<li>Object <code>series</code> - An object with for each probe, an array of data
from multiple runs.</li>
</ul>
<p><strong>Returns</strong>: <code>Object</code> - An stats object with a <code>mean</code> and <code>stdev</code> property.</p>
<h3 id="metriccompare-callback">metric.compare callback</h3>
<p><strong>Parameters</strong>:</p>
<ul>
<li>Object <code>a</code>: A stats object from the analyse callback.</li>
<li>Object <code>b</code>: A stats object from the analyse callback.</li>
</ul>
<p><strong>Returns</strong>: <code>number</code> - Difference between A and B, in the metric&#39;s unit,
or 0 if no significant change was found.</p>
</dd>
</dl>

<a name="module_cli"></a>

## cli
The command-line interface for Fresnel.

This module is invoked by `bin/fresnel` and is in charge of reading user
input such as CLI parameters, environment variables, and the `.fresnel.yml`
config file.

Interacts with: [conductor](#module_conductor).

<a name="module_compute"></a>

## compute
Functions to help with numerical computations.


* [compute](#module_compute)
    * [~subtract(seqA, seqB)](#module_compute..subtract) ⇒ <code>Array.&lt;number&gt;</code>
    * [~stats(values)](#module_compute..stats) ⇒ <code>Object</code>
    * [~diffStdev(before, after)](#module_compute..diffStdev) ⇒ <code>number</code>
    * [~mannWhitney(before, after)](#module_compute..mannWhitney) ⇒ <code>number</code>
    * [~diffMannWhitney(before, after)](#module_compute..diffMannWhitney) ⇒ <code>number</code>
    * [~ranks(values)](#module_compute..ranks) ⇒ <code>Array</code>

<a name="module_compute..subtract"></a>

### compute~subtract(seqA, seqB) ⇒ <code>Array.&lt;number&gt;</code>
Perform subtraction on each pair from two sequences.

Example:

    const seqA = [ 3.0, 3.0, 4.5 ];
    const seqB = [ 2.5, 2.6, 3.3 ];
    subtract( seqA, seqB );
    // [ 0.5, 0.4, 1.2 ]

**Kind**: inner method of [<code>compute</code>](#module_compute)  

| Param | Type |
| --- | --- |
| seqA | <code>Array.&lt;number&gt;</code> | 
| seqB | <code>Array.&lt;number&gt;</code> | 

<a name="module_compute..stats"></a>

### compute~stats(values) ⇒ <code>Object</code>
Compute statistics about a sequence of numbers.

Example:

    stats( [ 3, 4, 5 ] );
    // mean: 4.0, stdev: 0.82

**Kind**: inner method of [<code>compute</code>](#module_compute)  
**Returns**: <code>Object</code> - An object holding the mean average (`mean`),
 standard deviation (`stdev`) and values (`values`).  

| Param | Type |
| --- | --- |
| values | <code>Array.&lt;number&gt;</code> | 

<a name="module_compute..diffStdev"></a>

### compute~diffStdev(before, after) ⇒ <code>number</code>
Compare two objects from `stats()`.

Example:

    const a = stats( [ 3, 4, 5 ] );       // mean: 4.0, stdev: 0.82
    const b = stats( [ 1.0, 1.5, 2.0 ] ); // mean: 1.5, stdev: 0.41
    diffStdev( a, b );
    // -1.27

This is computed by creating a range of 1 stdev aroud each mean,
and if they don't overlap, the distance between them is returned.

In the above example, the range for sequence A is `3.18 ... 4.82`,
and the range for B is `1.09 ... 1.91`. The ranges don't overlap and
the distance between 3.18 and 1.91 is -1.27.

**Kind**: inner method of [<code>compute</code>](#module_compute)  
**Returns**: <code>number</code> - The difference between the before and after mean averages,
after having compensated for 1 standard deviation. If lower numbers are better
for your metric, then a negative difference represents an improvement.  

| Param | Type |
| --- | --- |
| before | <code>Object</code> | 
| after | <code>Object</code> | 

<a name="module_compute..mannWhitney"></a>

### compute~mannWhitney(before, after) ⇒ <code>number</code>
Perform an approximate Mann-Whitney U test on two sets of values to test
whether the values in the second set are significantly higher. The test
is a non-parametric test that compares the ranks of the values without
assuming they are distributed in a particular way.

For details of the test and calculations see:
https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test

This implementation is paraphrased from:
https://github.com/JuliaStats/HypothesisTests.jl/blob/b28a4587fe/src/mann_whitney.jl

Assumptions made by this implementation:
- each set contains the same number of values
- we are interested in whether values in the second set are higher
- the sample is large enough to use the approximate test

**Kind**: inner method of [<code>compute</code>](#module_compute)  
**Returns**: <code>number</code> - The p-value representing the likelihood of getting the
observed U score (or more extreme) under the null hypothesis, that a
randomly-chosen value from either set is equally likely to be higher or
lower than a randomly-chosen value from the other set.  

| Param | Type |
| --- | --- |
| before | <code>Object</code> | 
| after | <code>Object</code> | 

<a name="module_compute..diffMannWhitney"></a>

### compute~diffMannWhitney(before, after) ⇒ <code>number</code>
Compare two sets of values using the Mann-Witney U test.

**Kind**: inner method of [<code>compute</code>](#module_compute)  
**Returns**: <code>number</code> - Number between 0.0 and 1.0. A higher number may suggest the values have
increased, and a lower number may suggest the values remained the same or got lower.
It is computed as 1 minus the [Mann-Whitney p-value](#module_compute..mannWhitney).  
**See**: [#mannWhitney](#module_compute..mannWhitney)  

| Param | Type |
| --- | --- |
| before | <code>Object</code> | 
| after | <code>Object</code> | 

<a name="module_compute..ranks"></a>

### compute~ranks(values) ⇒ <code>Array</code>
Find the rank for each value, giving any tied values the mean of the ranks
that they cover. The ranks are used to calculate the U score. Also find
the adjustment constant, used for calculating the standard deviation of U.

Example:

    values: [ 4, 9, 8, 7, 3, 6, 6 ]
    sorted: [ 3, 4, 6, 6, 7, 8, 9 ]
    place:  [ 1, 6, 5, 4, 0, 2, 3 ]
    ranks:  [ 2, 7, 6, 5, 1, 3.5, 3.5 ]

**Kind**: inner method of [<code>compute</code>](#module_compute)  
**Returns**: <code>Array</code> - ranks of the values, adjustment constant  

| Param | Type |
| --- | --- |
| values | <code>Array.&lt;number&gt;</code> | 

<a name="module_conductor"></a>

## conductor
The program interface for Fresnel commands.

Interacts with: [puppeteer/Browser](https://pptr.dev/#?product=Puppeteer&version=v1.11.0&show=api-class-browser),
[Writer](#Writer), [Probe](#Probe), and [Report](#Report).


* [conductor](#module_conductor)
    * [~record(config, outputDir, label, progress)](#module_conductor..record) ⇒ <code>Object</code>
    * [~compare(outputDir, labelA, labelB)](#module_conductor..compare) ⇒ <code>Object</code>

<a name="module_conductor..record"></a>

### conductor~record(config, outputDir, label, progress) ⇒ <code>Object</code>
Create a Fresnel record.

This runs the scenarios from the given configuration object, and saves the
record and probe artefacts to an out subdirectory named after the label.

The Scenario URL may have placeholders for variables. These allow scenarios
to adapt to the current environment. For example, when testing an app
like MediaWiki, the hostname and port of the web server may vary in each
CI or development environment.

**Kind**: inner method of [<code>conductor</code>](#module_conductor)  
**Returns**: <code>Object</code> - Fresnel record.  
**Throws**:

- <code>Error</code> If configuration is invalid.
- <code>Error</code> If Writer can't create the output directory.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | Configuration object, e.g. from `.fresnel.yml`. |
| outputDir | <code>string</code> | File path |
| label | <code>string</code> | Record label. Must be valid as a directory name. |
| progress | <code>function</code> | Callback for handling internal events  as the recording progresses. |

<a name="module_conductor..compare"></a>

### conductor~compare(outputDir, labelA, labelB) ⇒ <code>Object</code>
Compare two Fresnel records.

**Kind**: inner method of [<code>conductor</code>](#module_conductor)  
**Returns**: <code>Object</code> - Comparison  
**Throws**:

- <code>Error</code> If records could not be read


| Param | Type | Description |
| --- | --- | --- |
| outputDir | <code>string</code> | File path |
| labelA | <code>string</code> | Record label |
| labelB | <code>string</code> | Record label |

<a name="module_printer"></a>

## printer
The text printer for the Fresnel command-line interface.

This module is invoked by [cli](#module_cli) to turn information from
[conductor](#module_conductor) into lines of text.


* [printer](#module_printer)
    * [~format(num, unit, [options])](#module_printer..format) ⇒ <code>string</code>
    * [~progress(writeln, event, message)](#module_printer..progress)
    * [~printTable(writeln, rows)](#module_printer..printTable)
    * [~comparison(writeln, compared)](#module_printer..comparison)

<a name="module_printer..format"></a>

### printer~format(num, unit, [options]) ⇒ <code>string</code>
**Kind**: inner method of [<code>printer</code>](#module_printer)  

| Param | Type | Description |
| --- | --- | --- |
| num | <code>number</code> |  |
| unit | <code>string</code> | One of "ms" or "B" (from [Report](#Report)) |
| [options] | <code>Object</code> |  |

<a name="module_printer..progress"></a>

### printer~progress(writeln, event, message)
**Kind**: inner method of [<code>printer</code>](#module_printer)  

| Param | Type |
| --- | --- |
| writeln | <code>function</code> | 
| event | <code>string</code> | 
| message | <code>string</code> \| <code>undefined</code> | 

<a name="module_printer..printTable"></a>

### printer~printTable(writeln, rows)
**Kind**: inner method of [<code>printer</code>](#module_printer)  

| Param | Type |
| --- | --- |
| writeln | <code>function</code> | 
| rows | <code>Array.&lt;Array&gt;</code> | 

<a name="module_printer..comparison"></a>

### printer~comparison(writeln, compared)
**Kind**: inner method of [<code>printer</code>](#module_printer)  

| Param | Type | Description |
| --- | --- | --- |
| writeln | <code>function</code> |  |
| compared | <code>Object</code> | As produced by [conductor.compare](#module_conductor..compare) |

<a name="module_probes/navtiming"></a>

## probes/navtiming
Get data from the Navigation Timing API in the browser.

**See**

- [Probe](#Probe)
- <https://www.w3.org/TR/navigation-timing-2/>

<a name="module_probes/paint"></a>

## probes/paint
Get data from the Paint Timing API in the browser.

**See**

- [Probe](#Probe)
- <https://www.w3.org/TR/paint-timing/>

<a name="module_probes/screenshot"></a>

## probes/screenshot
Capture a screenshot from the browser viewport after the
page has finished loading.

**See**: [Probe](#Probe)  
<a name="module_probes/trace"></a>

## probes/trace
Capture a trace file that can later be opened in Chrome DevTools
or [timeline-viewer](https://chromedevtools.github.io/timeline-viewer/).

**See**: [Probe](#Probe)  
<a name="module_probes/transfer"></a>

## probes/transfer
Get data from the Resource Timing API in the browser.

**See**

- [Probe](#Probe)
- <https://www.w3.org/TR/resource-timing-2/>

<a name="module_reports/navtiming"></a>

## reports/navtiming
Report on Navigation Timing API metrics.

**See**

- [Report](#Report)
- <https://www.w3.org/TR/navigation-timing-2/>

<a name="module_reports/paint"></a>

## reports/paint
Report on Paint Timing API metrics.

**See**

- [Report](#Report)
- <https://www.w3.org/TR/paint-timing/>

<a name="module_reports/transfer"></a>

## reports/transfer
Report with transfer sizes from the Resource Timing API.

**See**

- [Report](#Report)
- <https://www.w3.org/TR/resource-timing-2/>

<a name="Writer"></a>

## Writer
Represents a directory and an (optional) prefix for files and
subdirectories created within it.

**Kind**: global class  

* [Writer](#Writer)
    * [new Writer(dir, prefix)](#new_Writer_new)
    * [.getPath(name)](#Writer+getPath) ⇒ <code>string</code>
    * [.prefix(prefix)](#Writer+prefix) ⇒ [<code>Writer</code>](#Writer)
    * [.child(name)](#Writer+child) ⇒ [<code>Writer</code>](#Writer)

<a name="new_Writer_new"></a>

### new Writer(dir, prefix)
The specified directory will be created if needed.
Any parent directories must exist beforehand.

**Throws**:

- <code>Error</code> If directory can't be created.


| Param | Type | Description |
| --- | --- | --- |
| dir | <code>string</code> | File path |
| prefix | <code>string</code> |  |

<a name="Writer+getPath"></a>

### writer.getPath(name) ⇒ <code>string</code>
Get the file path for a resource in this writer's directory.

**Kind**: instance method of [<code>Writer</code>](#Writer)  
**Returns**: <code>string</code> - File path  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | File name |

<a name="Writer+prefix"></a>

### writer.prefix(prefix) ⇒ [<code>Writer</code>](#Writer)
Create a Writer object for the same directory, with
an added prefix for any files and subdirectories.

**Kind**: instance method of [<code>Writer</code>](#Writer)  

| Param | Type |
| --- | --- |
| prefix | <code>string</code> | 

<a name="Writer+child"></a>

### writer.child(name) ⇒ [<code>Writer</code>](#Writer)
Create a Writer object for a subdirectory of the current one.

**Kind**: instance method of [<code>Writer</code>](#Writer)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 

<a name="Probe"></a>

## Probe : <code>Object</code>
A probe is a set of callbacks to run client-side when [recording](#module_conductor..record)
scenarios.

#### probe.before

The `before` callback runs before the web page starts loading. Use this to make changes to the
browser tab (via [puppeteer/Page](https://pptr.dev/#?product=Puppeteer&version=v1.11.0&show=api-class-page), or higher-level objects accessed via that,
such as [puppeteer/Browser](https://pptr.dev/#?product=Puppeteer&version=v1.11.0&show=api-class-browser)). Examples of things one might do here:
set the viewport, start timeline tracing, disable JavaScript, grant permission for Geo location,
simulate a certain GPS position, etc.

Parameters:

- [puppeteer/Page](https://pptr.dev/#?product=Puppeteer&version=v1.11.0&show=api-class-page) `page`: The browser tab.
- [Writer](#Writer) `writer`: Use this to obtain file paths to write
  artefacts to.

#### probe.after

The `after` callback runs once the web page has finished loading. Use this to capture your
data. Typically by using `page.evaluate()` to send JavaScript code to the browser which will be
executed client-side in the context of the page. From there, you can access the DOM, other
web platform APIs, as well as any custom JavaScript interfaces exposed by code from the
web page itself.

Parameters:

- [puppeteer/Page](https://pptr.dev/#?product=Puppeteer&version=v1.11.0&show=api-class-page) `page`: The browser tab.
- [Writer](#Writer) `writer`: Use this to obtain file paths to write artefacts to.
- Function `addData`: Use this to store key/value pairs that should be
  saved as part of the Fresnel record. These must be serialisable as JSON.

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| [before] | <code>function</code> | 
| [after] | <code>function</code> | 
| [metrics] | <code>Object</code> | 

<a name="Report"></a>

## Report : <code>Object</code>
A report analyses data from a [Probe](#Probe) when [recording](#module_conductor..record)
and [comparing](#module_conductor..compare) scenario data.

    const compute = require( 'fresnel/src/compute' );
    module.exports = {
        probes: [ 'x' ],
        metrics: {
            example: {
                caption: 'An example metric.'
                unit: 'ms',
                analyse: ( series ) => compute.stats( series.x.mykey ),
                compare: ( a, b ) => compute.diffStdev( a, b )
            }
        }
    };

#### report.probes

Specify one or probes that provide the data needed for this report. The recording phase
uses this to determine which probes to run.

#### report.metrics

An object with one or more metric specifications. The key is the internal
name for the metric, and the value is an object with the following properties:

- string `caption` - A short description of this metric.
- string `unit` - The unit for this metric.
  Must be one of: `ms`, or `B`.
- Function `analyse` - A callback to aggregate and analyse data from thes probes,
  as gathered from multiple runs.
- Function `compare` - A callback to compare the two sets of analysed data, from
  two recordings.
- number `threshold` (optional) - If the compared difference is more than this
  value, a warning will be shown.

### metric.analyse callback

During each run of the same scenario, a probe can capture data into an object.
Here, the values from those objects have combined from each run into an array.

The analyser for a single metric, has access to all data from probes, and
must return an object with a `mean` and `stdev` property. This simplest
way to do that to pass a series to [compute.stats](#module_compute..stats)
and return its result.

For example, if probe `x` collects `{ mykey: 10 }` and `{ mykey: 12 }` from
two runs of the same scenario, it will be available here as `series.x.mykey`
containing `[ 10, 12 ]`.

**Parameters**:

- Object `series` - An object with for each probe, an array of data
  from multiple runs.

**Returns**: `Object` - An stats object with a `mean` and `stdev` property.

### metric.compare callback

**Parameters**:

- Object `a`: A stats object from the analyse callback.
- Object `b`: A stats object from the analyse callback.

**Returns**: `number` - Difference between A and B, in the metric's unit,
or 0 if no significant change was found.

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| probes | [<code>Array.&lt;Probe&gt;</code>](#Probe) \| <code>Array.&lt;string&gt;</code> | 
| metrics | <code>Object</code> | 


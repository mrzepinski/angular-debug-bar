angular-debug-bar
===========

Missing AngularJS Debug Bar, which helps you measure performance of your app.

Inspired by: https://github.com/lafikl/perfBar

[DEMO](http://mrzepinski.github.io/angular-debug-bar/)

![](http://i.imgur.com/ytrW5Bw.png)

### Usage:

Simply add:

~~~~html
<!-- CSS -->
<link rel="stylesheet" href="dist/css/angular-debug-bar.min.css" />

<!-- JS -->
<script type="text/javascript" src="dist/js/angular-debug-bar.min.js"></script>
~~~~

to your HTML and then load module `['angular-debug-bar']`
and put a directive invocation:

~~~~html
<angular-debug-bar></angular-debug-bar>
~~~~

at the end of your html template, before `</body>` tag.

#### Clear default plugins

You can disable all default loaded plugins.

~~~~javascript
.config(['debugBarProvider', function (debugBarProvider) {
  debugBarProvider.clearDefaultPlugins();
}]);
~~~~

`clearDefaultPlugins` takes one argument:
 * keepPlugins [Array][optional] - you can keep some plugins after clear action

#### Change refresh interval

You can set your own interval time. Default is `1000 ms`.

~~~~javascript
.config(['debugBarProvider', function (debugBarProvider) {
  debugBarProvider.setRefreshInterval(1000);
}]);
~~~~

#### Register custom plugin

From version `0.4.0` you can register your own plugin.

~~~~javascript
.config(['debugBarProvider', function (debugBarProvider) {
  debugBarProvider.registerPlugin('numberOfRequests', function () {
    if ('getEntriesByType' in window.performance) {
      return window.performance.getEntriesByType('resource').length
    }
    return 'N/A';
  }, {
    label: 'Number of requests'
  });
}]);
~~~~

`registerPlugin` function takes three arguments:
 * name [String][required] - name of your plugin to register and store value in the scope
 * valueFn [Function][required] - function which has to return your plugin value during checking
 * settings [Object][optional] - optional settings like:
  * label [String] - label to show below value
  * unit [String] - unit to show next to value
  * icon [String] - icon class to prepend value

### Modify and build

You can change default styles for the progress bar by editing `angular-debug-bar.scss`,
or override it in your own styles.

To build just type:
`npm install` & `bower install` & `gulp`

It will create CSS from SCSS file, and minify JS & CSS files.

### Contribution

Feel free to commit your code here :)

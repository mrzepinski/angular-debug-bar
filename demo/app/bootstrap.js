(function (window, angular, undefined) {
  'use strict';
  angular.module('adb', [
    'ngRoute',
    'adb.routing',
    'angular-debug-bar',
    'adb.controllers'
  ]).config(appConfig);

  appConfig.$inject = ['debugBarProvider'];

  function appConfig (debugBarProvider) {
    debugBarProvider.setRefreshInterval(2000);
    debugBarProvider.clearDefaultPlugins();
    debugBarProvider.registerPlugin('numberOfRequests', numberOfRequests, {
      label: 'Number of requests'
    });
  }

  function numberOfRequests () {
    if ('getEntriesByType' in window.performance) {
      return window.performance.getEntriesByType('resource').length
    }
    return 'N/A';
  }
}(window, window.angular));

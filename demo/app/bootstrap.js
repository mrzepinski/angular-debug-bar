(function (window, angular, undefined) {
    'use strict';

    angular.module('adb', [
        'ngRoute',
        'adb.routing',
        'angular-debug-bar',
        'adb.controllers'
    ]).config(['debugBarProvider', function (debugBarProvider) {
        // change interval
        debugBarProvider.setRefreshInterval(2000);

        // clear all default plugins
        debugBarProvider.clearDefaultPlugins();

        // register only one custom plugin
        debugBarProvider.registerPlugin('numberOfRequests', function () {
            if ('getEntriesByType' in window.performance) {
                return window.performance.getEntriesByType('resource').length
            }
            return 'N/A';
        }, {
            label: 'Number of requests'
        });
    }]);

}(window, window.angular));
(function (angular) {
    'use strict';

    angular.module('adb', [
        'ngRoute',
        'adb.routing',
        'angular-debug-bar',
        'adb.controllers'
    ]);

}(window.angular));
(function (angular, undefined) {
    'use strict';

    angular.module('adb.routing', []).config(['$routeProvider', function ($routeProvider) {

        $routeProvider
            .when('/home', {
                templateUrl: 'app/home/home.html',
                controller: 'HomeCtrl'
            })
            .when('/test', {
                templateUrl: 'app/test/test.html',
                controller: 'TestCtrl'
            })
            .otherwise({
                redirectTo: '/home'
            });

    }]);

}(window.angular));
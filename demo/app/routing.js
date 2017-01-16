(function (angular, undefined) {
  'use strict';
  angular.module('adb.routing', [])
    .config(routeConfig);

  routeConfig.$inject = ['$routeProvider'];

  function routeConfig ($routeProvider) {
    $routeProvider.when('/home', {
      templateUrl: 'app/home/home.html',
      controller: 'HomeCtrl'
    });
    $routeProvider.when('/test', {
      templateUrl: 'app/test/test.html',
      controller: 'TestCtrl'
    });
    $routeProvider.otherwise({
      redirectTo: '/home'
    });
  }
}(window.angular));

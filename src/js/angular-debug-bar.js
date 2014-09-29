'use strict';

angular.module('angular-debug-bar', []).directive('angular-debug-bar', [
    '$window', '$document',
    function ($window, $document) {
        return {
            restrict: 'E',
            link: function ($scope, $element) {
                
            }
        };
    }
]);

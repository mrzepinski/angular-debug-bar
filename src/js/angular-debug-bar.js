(function (window, document, angular, undefined) {
  'use strict';

  var DEBUG_BAR_MODULE = angular.module('angular-debug-bar', []);

  DEBUG_BAR_MODULE.provider('debugBar', debugBarProvider);
  DEBUG_BAR_MODULE.directive('angularDebugBarPlugins', angularDebugBarPlugins);
  DEBUG_BAR_MODULE.directive('angularDebugBar', angularDebugBar);

  function debugBarProvider () {

    var that = this;
    var DEFAULT_INTERVAL = 1000;
    var INITIAL_TIMEOUT = 100;
    var PLUGINS = {};
    var PERFORMANCE = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;
    var DEFAULT_SETTINGS_KEYS = ['label', 'icon', 'unit'];
    var DEFAULT_PLUGINS = [
      {
        name: 'watchCount',
        invokeFn: function () {
          var root = angular.element(document.getElementsByTagName('html')),
            watchers = [],
            func = function (element) {
              if (element.data().hasOwnProperty('$scope')) {
                angular.forEach(element.data().$scope.$$watchers, function (watcher) {
                  watchers.push(watcher);
                });
              }

              angular.forEach(element.children(), function (childElement) {
                func(angular.element(childElement));
              });
            };
          if (0 === watchers.length) {
            func(root);
          }
          return watchers.length;
        },
        settings: {
          label: 'Watchers',
          icon: 'adb-icon-eye'
        }
      },
      {
        name: 'listenerCount',
        invokeFn: function () {
          var root = angular.element(document.getElementsByTagName('html')),
            listeners = [],
            func = function (element) {
              if (element.data().hasOwnProperty('$scope')) {
                angular.forEach(element.data().$scope.$$listeners, function (listener) {
                  listeners.push(listener);
                });
              }

              angular.forEach(element.children(), function (childElement) {
                func(angular.element(childElement));
              });
            };
          if (0 === listeners.length) {
            func(root);
          }
          return listeners.length;
        },
        settings: {
          label: 'Listeners',
          icon: 'adb-icon-headphones'
        }
      },
      {
        name: 'DOMObjectCount',
        invokeFn: function () {
          return document.all.length;
        },
        settings: {
          label: 'DOM objects',
          icon: 'adb-icon-home'
        }
      },
      {
        name: 'loadTime',
        invokeFn: function () {
          return (PERFORMANCE.timing.loadEventStart - PERFORMANCE.timing.navigationStart);
        },
        settings: {
          label: 'Load time',
          unit: 'ms'
        }
      },
      {
        name: 'latency',
        invokeFn: function () {
          return (PERFORMANCE.timing.responseStart - PERFORMANCE.timing.connectStart);
        },
        settings: {
          label: 'Latency',
          unit: 'ms'
        }
      },
      {
        name: 'cssFilesCount',
        invokeFn: function () {
          return document.querySelectorAll('link[rel="stylesheet"]').length;
        },
        settings: {
          label: 'CSS files'
        }
      },
      {
        name: 'jsFilesCount',
        invokeFn: function () {
          return document.querySelectorAll('script').length;
        },
        settings: {
          label: 'JS files'
        }
      },
      {
        name: 'imagesCount',
        invokeFn: function () {
          return document.querySelectorAll('img').length;
        },
        settings: {
          label: 'Images'
        }
      },
      {
        name: 'numberOfRequests',
        invokeFn: function () {
          if ('getEntriesByType' in window.performance) {
            return window.performance.getEntriesByType('resource').length
          }
          return 'N/A';
        },
        settings: {
          label: 'Number of requests'
        }
      }
    ];

    var PluginAbstract = function () {};

    angular.extend(PluginAbstract.prototype, {
      extendedScope: undefined,
      settings: undefined,
      invokeFn: angular.noop,
      setScope: function (scope) {
        Object.getPrototypeOf(this).extendedScope = scope;
      },
      getSettings: function () {
        return this.settings;
      },
      run: function () {
        this.extendedScope[this.settings.name] = this.invokeFn();
      }
    });

    (function init () {
      angular.forEach(DEFAULT_PLUGINS, function (plugin) {
        registerPlugin(plugin.name, plugin.invokeFn, plugin.settings);
      });
    })();

    that.clearDefaultPlugins = clearDefaultPlugins;
    that.setRefreshInterval = setRefreshInterval;
    that.registerPlugin = registerPlugin;
    that.$get = $get;

    function clearDefaultPlugins (keepPlugins) {
      keepPlugins = keepPlugins || [];
      PLUGINS = _pick(PLUGINS, keepPlugins);
    }

    function setRefreshInterval (interval) {
      DEFAULT_INTERVAL = parseInt(interval, 10) || DEFAULT_INTERVAL;
    }

    function registerPlugin (name, invokeFn, settings) {
      if (!angular.isString(name) && '' !== name) {
        throw new Error('Plugin name: "' + name + '" is not valid string value!');
      }
      if (PLUGINS[name]) {
        throw new Error('Plugin "' + name + '" already exists!');
      }
      if (!angular.isFunction(invokeFn)) {
        throw new Error('Value function is required!');
      }
      if (settings && !angular.isObject(settings)) {
        throw new Error('Settings is not an object!');
      }
      if (!settings) {
        settings = {};
      } else {
        settings = _pick(settings, DEFAULT_SETTINGS_KEYS);
      }
      angular.extend(settings, {
        name: name
      });
      var Fn = function () {};
      Fn.prototype = new PluginAbstract();
      angular.extend(Fn.prototype, {
        settings: angular.extend(angular.copy(DEFAULT_SETTINGS_KEYS), settings),
        invokeFn: invokeFn
      });
      PLUGINS[name] = new Fn();
    }

    /* @ngInject */
    function $get ($interval, $timeout) {
      var INTERVAL;
      return {
        getPlugins: function () {
          return angular.copy(PLUGINS);
        },
        run: function () {
          if (INTERVAL) {
            $interval.cancel(INTERVAL);
          } else {
            runForEach();
          }

          INTERVAL = $interval(runForEach, DEFAULT_INTERVAL);

          function runForEach () {
            $timeout(function () {
              angular.forEach(PLUGINS, function (plugin) {
                plugin.run();
              });
            }, !INTERVAL ? INITIAL_TIMEOUT : 0);
          }
        }
      };
    }

    function _pick (object, props) {
      var index = -1;
      var length = props.length;
      var result = {};
      while (++index < length) {
        var key = props[index];
        if (key in object) {
          result[key] = object[key];
        }
      }
      return result;
    }
  }

  /* @ngInject */
  function angularDebugBarPlugins ($compile) {
    return {
      restrict: 'E',
      replace: true,
      scope: false,
      template: '<ul></ul>',
      link: linkFn
    };

    function linkFn ($scope, $element) {
      angular.forEach($scope.plugins, function (plugin) {
        plugin.setScope($scope);
        $element.append($compile(template(plugin.getSettings()))($scope));
      });
    }

    function template (settings) {
      var template = '<li><div class="value-wrapper">';
      if (settings.icon) {
        template += '<i class="' + settings.icon + '"></i>';
      }
      template += '<span class="value" ng-bind="' + settings.name + '"></span>';
      if (settings.unit) {
        template += '<span class="unit">' + settings.unit + '</span>';
      }
      template += '</div>';
      if (settings.label) {
        template += '<h3 class="label">' + settings.label + '</h3>';
      }
      return template + '</li>';
    }
  }

  /* @ngInject */
  function angularDebugBar ($compile, debugBar) {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      controller: controller,
      compile: compile
    };

    function controller ($scope) {
      var localStorage = window.localStorage;
      var localStorageKey = 'adb.open';

      $scope.plugins = {};
      $scope.show = isLocalStorageAvailable() ? JSON.parse(localStorage.getItem(localStorageKey)) : false;
      if ($scope.show) {
        debugBar.run();
      }

      $scope.showHide = function (event) {
        event.preventDefault();
        $scope.show = !$scope.show;
        if (isLocalStorageAvailable()) {
          localStorage.setItem(localStorageKey, $scope.show);
        }
        if ($scope.show) {
          debugBar.run();
        }
      };

      function isLocalStorageAvailable () {
        return !!localStorage;
      }
    }

    /* @ngInject */
    function compile ($element) {
      var template = [
        '<div id="angular-debug-bar" ng-class="{ \'show\': show }">',
        '  <button class="adb-icon-cog" ng-click="showHide($event)"></button>',
        '  <angular-debug-bar-plugins></angular-debug-bar-plugins>',
        '</div>'
      ].join('');

      return function linkFn ($scope) {
        $scope.plugins = debugBar.getPlugins();
        $element.replaceWith($compile(template)($scope));
      };
    }
  }
})(window, window.document, window.angular);

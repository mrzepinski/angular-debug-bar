(function (window, document, angular, undefined) {
    'use strict';

    var DEBUG_BAR_MODULE = angular.module('angular-debug-bar', []);

    DEBUG_BAR_MODULE.provider('debugBar', function () {

        var DEFAULT_INTERVAL = 1000,
            INITIAL_TIMEOUT = 100,
            PLUGINS = {},
            PERFORMANCE = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance,
            DEFAULT_SETTINGS_KEYS = ['label', 'icon', 'unit'],
            PluginAbstract = function () {},
            _pick = function (object, props) {
                var index = -1,
                    length = props.length,
                    result = {};

                while (++index < length) {
                    var key = props[index];
                    if (key in object) {
                        result[key] = object[key];
                    }
                }
                return result;
            },
            setUpDefaultPlugins = function (that) {
                that.registerPlugin('watchCount', function () {
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
                }, {
                    label: 'Watchers',
                    icon: 'adb-icon-eye'
                });

                that.registerPlugin('listenerCount', function () {
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
                }, {
                    label: 'Listeners',
                    icon: 'adb-icon-headphones'
                });

                that.registerPlugin('DOMObjectCount', function () {
                    return document.all.length;
                }, {
                    label: 'DOM objects',
                    icon: 'adb-icon-home'
                });

                that.registerPlugin('loadTime', function () {
                    return (PERFORMANCE.timing.loadEventStart - PERFORMANCE.timing.navigationStart);
                }, {
                    label: 'Load time',
                    unit: 'ms'
                });

                that.registerPlugin('latency', function () {
                    return (PERFORMANCE.timing.responseStart - PERFORMANCE.timing.connectStart);
                }, {
                    label: 'Latency',
                    unit: 'ms'
                });

                that.registerPlugin('cssFilesCount', function () {
                    return document.querySelectorAll('link[rel="stylesheet"]').length;
                }, {
                    label: 'CSS files'
                });

                that.registerPlugin('jsFilesCount', function () {
                    return document.querySelectorAll('script').length;
                }, {
                    label: 'JS files'
                });

                that.registerPlugin('imagesCount', function () {
                    return document.querySelectorAll('img').length;
                }, {
                    label: 'Images'
                });

                that.registerPlugin('numberOfRequests', function () {
                    if ('getEntriesByType' in window.performance) {
                        return window.performance.getEntriesByType('resource').length
                    }
                    return 'N/A';
                }, {
                    label: 'Number of requests'
                });
            };

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

        this.clearDefaultPlugins = function () {
            PLUGINS = {};
        };

        this.setRefreshInterval = function (interval) {
            DEFAULT_INTERVAL = parseInt(interval, 10) || DEFAULT_INTERVAL;
        };

        this.registerPlugin = function (name, invokeFn, settings, undefined) {
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
        };

        setUpDefaultPlugins(this);

        this.$get = ['$interval', '$timeout', function ($interval, $timeout) {
            var INTERVAL;

            return {
                getPlugins: function () {
                    return angular.copy(PLUGINS);
                },
                run: function () {
                    var runForEach = function () {
                        $timeout(function () {
                            angular.forEach(PLUGINS, function (plugin) {
                                plugin.run();
                            });
                        }, !INTERVAL ? INITIAL_TIMEOUT : 0);
                    };

                    if (INTERVAL) {
                        $interval.cancel(INTERVAL);
                    } else {
                        runForEach();
                    }
                    INTERVAL = $interval(runForEach, DEFAULT_INTERVAL);
                }
            };
        }];

    });

    DEBUG_BAR_MODULE.directive('angularDebugBarPlugins', [
        '$compile',
        function ($compile) {
            var template = function (settings) {
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
            };

            return {
                restrict: 'E',
                replace: true,
                scope: false,
                template: '<ul></ul>',
                link: function (scope, element) {
                    angular.forEach(scope.plugins, function (plugin) {
                        plugin.setScope(scope);
                        element.append($compile(template(plugin.getSettings()))(scope));
                    });
                }
            };
        }
    ]);

    DEBUG_BAR_MODULE.directive('angularDebugBar', [
        '$compile', 'debugBar',
        function ($compile, debugBar) {
            return {
                restrict: 'E',
                replace: true,
                scope: true,
                controller: ['$scope', function ($scope) {
                    var localStorage = window.localStorage,
                        localStorageKey = 'adb.open',
                        isLocalStorageAvailable = function () {
                            return !!localStorage;
                        };

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
                }],
                compile: function ($element) {
                    var template = '<div id="angular-debug-bar" ng-class="{ \'show\': show }">' +
                        '<button class="adb-icon-cog" ng-click="showHide($event)"></button>' +
                        '<angular-debug-bar-plugins></angular-debug-bar-plugins>' +
                        '</div>';

                    return function ($scope) {
                        $scope.plugins = debugBar.getPlugins();
                        $element.replaceWith($compile(template)($scope));
                    };
                }
            };
        }
    ]);
})(window, window.document, window.angular);

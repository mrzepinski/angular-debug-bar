// AngularJS-Debug-Bar - Maciej Rzepinski
// git://github.com/mrzepinski/angular-debug-bar.git - MIT License
(function (window, document, angular, undefined) {
    'use strict';

    var debugBar = angular.module('angular-debug-bar', []);

    debugBar.factory('DebugBarFactory', [
        '$timeout',
        function ($timeout) {
            var plugins = {},
                performance = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance,
                PluginAbstract = function () {},
                registerPlugin = function (name, extend) {
                    var Fn = function () {};
                    Fn.prototype = new PluginAbstract();
                    angular.extend(Fn.prototype, extend);
                    plugins[name] = new Fn();
                    return plugins[name];
                },
                defaultParams = {
                    valueName: undefined,
                    unit: undefined,
                    label: undefined,
                    icon: undefined
                },
                reload = function () {
                    angular.forEach(plugins, function (plugin) {
                        plugin.setDefault();
                    });
                },
                runPlugin = function (pluginFn) {
                    $timeout(pluginFn, 1000);
                },
                DebugBarFactory = {
                    reload: reload,
                    registerPlugin: registerPlugin,
                    getPlugins: function () {
                        return plugins;
                    }
                };

            angular.extend(PluginAbstract.prototype, {
                setDefault: function () {
                    throw new Error('Unimplemented method :setDefault');
                },
                extendScope: function () {
                    throw new Error('Unimplemented method :extendScope');
                },
                getParams: function () {
                    throw new Error('Unimplemented method :getParams');
                }
            });

            // Plugin $watch count
            registerPlugin('watchCount', {
                setDefault: function () {
                    this.scope.watchCount = 0;
                },
                extendScope: function (scope) {
                    scope.watchCount = 0;

                    runPlugin(function () {
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
                        scope.watchCount = watchers.length;
                    });
                },
                getParams: function () {
                    var params = angular.copy(defaultParams);
                    angular.extend(params, {
                        valueName: 'watchCount',
                        label: 'Watchers',
                        icon: 'icon-eye'
                    });
                    return params;
                }
            });

            // Plugin $listener count
            registerPlugin('listenerCount', {
                setDefault: function () {
                    this.scope.listenerCount = 0;
                },
                extendScope: function (scope) {
                    scope.listenerCount = 0;

                    runPlugin(function () {
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
                        scope.listenerCount = listeners.length;
                    });
                },
                getParams: function () {
                    var params = angular.copy(defaultParams);
                    angular.extend(params, {
                        valueName: 'listenerCount',
                        label: 'Listeners',
                        icon: 'icon-headphones'
                    });
                    return params;
                }
            });

            // Plugin DOM object count
            registerPlugin('DOMObjectCount', {
                setDefault: function () {
                    this.scope.DOMObjectCount = 0;
                },
                extendScope: function (scope) {
                    scope.DOMObjectCount = 0;

                    runPlugin(function () {
                        scope.DOMObjectCount = document.all.length;
                    });
                },
                getParams: function () {
                    var params = angular.copy(defaultParams);
                    angular.extend(params, {
                        valueName: 'DOMObjectCount',
                        label: 'DOM objects',
                        icon: 'icon-home'
                    });
                    return params;
                }
            });

            // Plugin load time
            registerPlugin('loadTime', {
                setDefault: function () {
                    this.scope.loadTime = 0;
                },
                extendScope: function (scope) {
                    scope.loadTime = 0;

                    runPlugin(function () {
                        scope.loadTime = (performance.timing.loadEventStart - performance.timing.navigationStart);
                    });
                },
                getParams: function () {
                    var params = angular.copy(defaultParams);
                    angular.extend(params, {
                        valueName: 'loadTime',
                        label: 'Load time',
                        unit: 'ms'
                    });
                    return params;
                }
            });

            // Plugin latency
            registerPlugin('latency', {
                setDefault: function () {
                    this.scope.latency = 0;
                },
                extendScope: function (scope) {
                    scope.latency = 0;

                    runPlugin(function () {
                        scope.latency = (performance.timing.responseStart - performance.timing.connectStart);
                    });
                },
                getParams: function () {
                    var params = angular.copy(defaultParams);
                    angular.extend(params, {
                        valueName: 'latency',
                        label: 'Latency',
                        unit: 'ms'
                    });
                    return params;
                }
            });

            // Plugin cssCount
            registerPlugin('cssCount', {
                setDefault: function () {
                    this.scope.cssCount = 0;
                },
                extendScope: function (scope) {
                    scope.cssCount = 0;

                    runPlugin(function () {
                        scope.cssCount = document.querySelectorAll('link[rel="stylesheet"]').length;
                    });
                },
                getParams: function () {
                    var params = angular.copy(defaultParams);
                    angular.extend(params, {
                        valueName: 'cssCount',
                        label: 'CSS'
                    });
                    return params;
                }
            });

            // Plugin jsCount
            registerPlugin('jsCount', {
                setDefault: function () {
                    this.scope.jsCount = 0;
                },
                extendScope: function (scope) {
                    scope.jsCount = 0;

                    runPlugin(function () {
                        scope.jsCount = document.querySelectorAll('script').length;
                    });
                },
                getParams: function () {
                    var params = angular.copy(defaultParams);
                    angular.extend(params, {
                        valueName: 'jsCount',
                        label: 'JS'
                    });
                    return params;
                }
            });

            // Plugin imgCount
            registerPlugin('imgCount', {
                setDefault: function () {
                    this.scope.imgCount = 0;
                },
                extendScope: function (scope) {
                    scope.imgCount = 0;

                    runPlugin(function () {
                        scope.imgCount = document.querySelectorAll('img').length;
                    });
                },
                getParams: function () {
                    var params = angular.copy(defaultParams);
                    angular.extend(params, {
                        valueName: 'imgCount',
                        label: 'Images'
                    });
                    return params;
                }
            });

            return DebugBarFactory;
        }
    ]);

    debugBar.directive('angularDebugBarPlugins', [
        '$compile',
        function ($compile) {
            var template = function (pluginParams) {
                var template = '<li><div class="value-wrapper">';
                if (pluginParams.icon) {
                    template += '<i class="' + pluginParams.icon + '"></i>';
                }
                template += '<span class="value" ng-bind="' + pluginParams.valueName + '"></span>';
                if (pluginParams.unit) {
                    template += '<span class="unit">' + pluginParams.unit + '</span>';
                }
                template += '</div>';
                if (pluginParams.label) {
                    template += '<h3 class="label">' + pluginParams.label + '</h3>';
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
                        var pluginScope = scope.$new();
                        plugin.scope = pluginScope;
                        plugin.extendScope(pluginScope);
                        element.append($compile(template(plugin.getParams()))(pluginScope));
                    });
                }
            };
        }
    ]);

    debugBar.directive('angularDebugBar', [
        '$compile', 'DebugBarFactory',
        function ($compile, DebugBarFactory) {
            return {
                restrict: 'E',
                replace: true,
                scope: true,
                controller: function ($scope) {
                    $scope.plugins = {};
                    $scope.show = false;

                    $scope.showHide = function (event) {
                        event.preventDefault();
                        $scope.show = !$scope.show;
                    };
                },
                compile: function ($element) {
                    var template = '<div id="angular-debug-bar" ng-class="{ \'show\': show }">' +
                        '<button class="icon-cog" ng-click="showHide($event)"></button>' +
                        '<angular-debug-bar-plugins></angular-debug-bar-plugins>' +
                        '</div>';

                    return function ($scope) {
                        $scope.plugins = DebugBarFactory.getPlugins();
                        $element.replaceWith($compile(template)($scope));
                        $scope.$on('$routeChangeSuccess', function () {
                            DebugBarFactory.reload();
                        });
                    };
                }
            };
        }
    ]);
})(window, window.document, window.angular);

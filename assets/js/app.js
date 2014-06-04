/**
 * Example application for ng-timer (https://github.com/ianwalter/ng-timer)
 *
 * @author Ian Kennington Walter (http://ianvonwalter.com)
 */
requirejs.config({
  baseUrl: '.',
  paths: {
    'angular': [
      '//ajax.googleapis.com/ajax/libs/angularjs/1.2.4/angular.min',
      'assets/lib/angular/angular'
    ],
    'angular-route': [
      '//ajax.googleapis.com/ajax/libs/angularjs/1.2.4/angular-route.min',
      'assets/lib/angular-route/angular-route.min'
    ],
    'ng-context-menu': [
      'dist/angular-context-menu'
    ]
  },
  shim: {
    'angular' : { 'exports' : 'angular' },
    'angular-route': { deps:['angular'] },
    'ng-context-menu': { deps:['angular'] }
  }
});

require(['angular', 'angular-route', 'ng-context-menu'], function(angular) {
  "use strict";

  var app = angular.module('menu-demo', ['ngRoute', 'ng-context-menu'])
    .config(['$routeProvider', function($routeProvider) {
      $routeProvider
        .when('/', { controller: 'HomeController', templateUrl: 'assets/template/home.html', label: 'Home' })
        .otherwise({ redirectTo: '/' });
    }]);

  app.controller('HomeController', [
    '$scope',
    function($scope) {
      $scope.message  = 'Right click triggered';

      $scope.onRightClick = function(msg) {
        console.log(msg);
      };

    }
  ]);

  angular.bootstrap(document , ['menu-demo']);
});

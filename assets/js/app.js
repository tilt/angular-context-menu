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

  angular.module('menu-demo', ['ngRoute', 'ng-context-menu'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', { controller: 'HomeController', templateUrl: 'assets/template/home.html', label: 'Home' })
      .otherwise({ redirectTo: '/' });
  }])

  .controller('HomeController', [
    '$scope',
    function($scope) {
      $scope.message  = 'Right click triggered';

      $scope.contextData = ['one', 'two', 'three'];

      $scope.onRightClick = function(msg) {
        console.log(msg);
      };

    }
  ])

  .factory('MyMenu', ['ngContextMenu', function(ngContextMenu) {
    return ngContextMenu({
      controller: 'MyContextMenuController',
      controllerAs: 'contextMenu',
      templateUrl: 'assets/template/my_menu.html'
    });
  }])
  .controller('MyContextMenuController', ['$scope', function($scope) {
    // $scope.menuData is injected as a local.
    $scope.menuEntryText = 'Menu entry for ' + $scope.menuData;
  }]);

  angular.bootstrap(document , ['menu-demo']);
});

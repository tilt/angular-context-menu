/**
 * @license
 * angular-context-menu - v0.0.10 - An AngularJS directive to display a context menu
 * (c) 2014
 * License: MIT
 *
 * @authors Brian Ford (http://briantford.com), Ian Kennington Walter (http://ianvonwalter.com), Till Breuer (https://github.com/tilt)
 */

angular.module('ng-context-menu', [])

.factory('ngContextMenu', [
  '$q',
  '$http',
  '$compile',
  '$templateCache',
  '$animate',
  '$rootScope',
  '$controller',
  function($q, $http, $compile, $templateCache, $animate, $rootScope, $controller) {

    return function contextMenuFactory(config) {
      if (!(!config.template ^ !config.templateUrl)) {
        throw new Error('Expected context menu to have exacly one of either `template` or `templateUrl`');
      }

      var template      = config.template,
          controller    = config.controller || angular.noop,
          controllerAs  = config.controllerAs,
          container     = angular.element(config.container || document.body),
          element       = null,
          loadTemplate,
          scope;

      if (config.template) {
        var deferred = $q.defer();
        deferred.resolve(config.template);
        loadTemplate = deferred.promise;
      } else {
        loadTemplate = $http.get(config.templateUrl, {
          cache: $templateCache
        }).
        then(function (response) {
          return response.data;
        });
      }

      function open (position, locals) {
        if (scope && locals) {
          setLocals(locals);
        }

        return loadTemplate.then(function (html) {
          if (!element) {
            attach(html, locals);
          }

          // set absolute position
          element.css('top', Math.max(position.y, 0) + 'px');
          element.css('left', Math.max(position.x, 0) + 'px');
        });
      }


      function attach (html, locals) {
        element = angular.element(html);
        if (element.length === 0) {
         throw new Error('The template contains no elements; you need to wrap text nodes');
        }
        $animate.enter(element, container);

        // create a new scope and copy locals to it
        scope = $rootScope.$new();
        if (locals) {
          setLocals(locals);
        }

        var ctrl = $controller(controller, { $scope: scope });
        if (controllerAs) {
         scope[controllerAs] = ctrl;
        }
        $compile(element)(scope);
      }

      function setLocals(locals) {
        for (var prop in locals) {
         scope[prop] = locals[prop];
        }
      }

      function close () {
        var deferred = $q.defer();
        if (element) {
          $animate.leave(element, function () {
            scope.$destroy();
            element = null;
            deferred.resolve();
          });
        } else {
          deferred.resolve();
        }
        return deferred.promise;
      }

      function active () {
        return !!element;
      }

      return {
        open: open,
        close: close,
        active: active,
      };

    };
}])

.directive('hasContextMenu', [
  '$injector',
  '$window',
  '$parse',
  function($injector, $window, $parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var openTarget,
        contextMenu = $injector.get(attrs.target),
        locals = {},
        win = angular.element($window),
        menuElement,
        triggerOnEvent = attrs.triggerOnEvent || 'contextmenu';

      /* contextMenu      is a mandatory attribute and used to bind a specific context
                          menu to the trigger event
         triggerOnEvent   allows for binding the event for opening the menu to "click" */

      // prepare locals, these define properties to be passed on to the context menu scope
      var localKeys = attrs.locals.split(',').map(function(local) {
        return local.trim();
      });
      angular.forEach(localKeys, function(key) {
        locals[key] = scope[key];
      });


      function open(event) {
        contextMenu.open({x: event.pageX, y: event.pageY}, locals);
      }

      function close() {
        contextMenu.close();
      }

      element.bind(triggerOnEvent, function(event) {
        openTarget = event.target;
        event.preventDefault();
        event.stopPropagation();

        scope.$apply(function() {
          open(event);
        });
      });

      win.bind('keyup', function(event) {
        if (contextMenu.active() && event.keyCode === 27) {
          scope.$apply(function() {
            close();
          });
        }
      });

      function handleWindowClickEvent(event) {
        if (contextMenu.active() && openTarget && event.button !== 2) {

          scope.$apply(function() {
            close();
          });
        }
      }

      // Firefox treats a right-click as a click and a contextmenu event while other browsers
      // just treat it as a contextmenu event
      win.bind('click', handleWindowClickEvent);
      win.bind(triggerOnEvent, handleWindowClickEvent);
    }
  };
}]);

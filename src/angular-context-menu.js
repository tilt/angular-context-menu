/**
 * @license
 * angular-context-menu - v0.1.4 - An AngularJS directive to display a context menu
 * (c) 2014
 * License: MIT
 *
 * @authors Brian Ford (http://briantford.com), Ian Kennington Walter (http://ianvonwalter.com), Till Breuer (https://github.com/tilt), Gelu Timoficiuc (https://github.com/tgelu)
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
          element       = null,
          container     = null,
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

      function open (locals, css) {
        if (scope && locals) {
          setLocals(locals);
        }

        return loadTemplate.then(function (html) {
          if (!element) {
            attach(html, locals);
          }
          if (css) {
            element.css(css);
          }
          adjustPosition(element);
          return element;
        });
      }

      function attach (html, locals) {
        container = angular.element(config.container || document.body);
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

      function setLocals (locals) {
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

      function adjustPosition(element) {
        var windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
        var windowWidth = 'innerWidth' in window ? window.innerWidth : document.documentElement.offsetWidth;
        if (windowHeight < element[0].offsetTop + element[0].offsetHeight) {
          element.css('top', element[0].offsetTop - element[0].offsetHeight + 'px');
        }
        if (windowWidth < element[0].offsetLeft + element[0].offsetWidth) {
          element.css('left', element[0].offsetLeft - element[0].offsetWidth + 'px');
        }
      }

      function active () {
        return !!element;
      }

      return {
        open: open,
        close: close,
        active: active
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
      if (attrs.locals) {
        var localKeys = attrs.locals.split(',');
        angular.forEach(localKeys, function(key) {
          key = key.trim();
          locals[key] = scope[key];
        });
      }


      function open(event) {
        // set absolute position
        contextMenu.open(locals, getCssPositionProperties(event));
      }

      function close() {
        contextMenu.close();
      }

      function getCssPositionProperties(event) {
        if (event.pageX || event.pageY) {
          clickX = event.pageX;
          clickY = event.pageY;
        } else {
          clickX = event.clientX + document.documentElement.scrollLeft;
          clickY = event.clientY + document.documentElement.scrollTop;
        }
        return {
          left: Math.max(clickX, 0) + 'px',
          top: Math.max(clickY, 0) + 'px'
        };
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

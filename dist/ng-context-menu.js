/**
 * ng-context-menu - v0.0.9 - An AngularJS directive to display a context menu when a right-click event is triggered
 *
 * @author Ian Kennington Walter (http://ianvonwalter.com)
 * @collaborator Till Breuer (https://github.com/tilt)
 */
angular
  .module('ng-context-menu', [])

  .service('ContextMenuService', [function() {
    var target;

    // shared context
    var contextMenu = {
      opened: false,
      context: {},
    };

    return {
      open: function() {
        contextMenu.opened = true;

        target.addClass('opened');
      },
      close: function() {
        contextMenu.opened = false;
        contextMenu.context = {};

        target.removeClass('opened');
      },
      opened: function() {
        return contextMenu.opened;
      },
      setContext: function(scope) {
        contextMenu.context = scope;
      },
      getContextMenu: function() {
        return contextMenu;
      },

      getTarget: function() {
        return target;
      },
      setTarget: function(element) {
        target = element;
      }
    };
  }])

  .directive('hasContextMenu', ['$window', '$parse', 'ContextMenuService', function($window, $parse, ContextMenuService) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var openTarget,
          disabled = scope.$eval(attrs.contextMenuDisabled),
          win = angular.element($window),
          menuElement = null,
          fn = $parse(attrs.contextMenu),
          triggerOnEvent = attrs.triggerOnEvent || 'contextmenu',
          processEvent = $parse(attrs.processEvent)(scope) || angular.noop;

        function open(event, element) {
          element.css('top', Math.max(event.pageY, 0) + 'px');
          element.css('left', Math.max(event.pageX, 0) + 'px');

          ContextMenuService.open();
        }

        function close(element) {
          ContextMenuService.close();
        }

        element.bind(triggerOnEvent, function(event) {
          if (!disabled) {
            // Make sure the DOM is set before we try to find the menu
            if (menuElement === null) {
              menuElement = attrs.target ? angular.element(document.getElementById(attrs.target)) : ContextMenuService.getTarget();
            }

            ContextMenuService.setTarget(menuElement);

            openTarget = event.target;
            event.preventDefault();
            event.stopPropagation();
            scope.$apply(function() {
              ContextMenuService.setContext(scope);

              fn(scope, { $event: event });
              processEvent(event);
              open(event, menuElement);
            });
          }
        });

        win.bind('keyup', function(event) {
          if (!disabled && ContextMenuService.opened() && event.keyCode === 27) {
            scope.$apply(function() {
              close(menuElement);
            });
          }
        });

        function handleWindowClickEvent(event) {
          if (!disabled && ContextMenuService.opened() && (event.button !== 2 || event.target !== openTarget)) {
            scope.$apply(function() {
              close(menuElement);
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

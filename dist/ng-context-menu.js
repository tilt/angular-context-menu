/**
 * ng-context-menu - v0.0.9 - An AngularJS directive to display a context menu when a right-click event is triggered
 *
 * @author Ian Kennington Walter (http://ianvonwalter.com)
 * @collaborator Till Breuer (https://github.com/tilt)
 */
angular
  .module('ng-context-menu', [])

  .service('ContextMenuService', [function() {
    var registeredMenuElements = {};

    // shared context
    var contextMenu = {
      opened: false,
      targetMenu: null,
      context: {},
    };

    return {
      open: function(targetMenu) {
        contextMenu.targetMenu = targetMenu;
        contextMenu.opened = true;

        registeredMenuElements[targetMenu].addClass('opened');
      },
      close: function(targetMenu) {
        contextMenu.targetMenu = null;
        contextMenu.opened = false;
        contextMenu.context = {};

        angular.forEach(registeredMenuElements, function(element) {
          element.removeClass('opened');
        });
      },
      opened: function() {
        return contextMenu.opened;
      },

      registerMenuElement: function(target, menuElement) {
        registeredMenuElements[target] = menuElement;
      },
      getMenuElement: function(target) {
        return registeredMenuElements[target];
      },

      setContext: function(scope) {
        contextMenu.context = scope;
      },
      getContextMenu: function() {
        return contextMenu;
      },

      getCurrentTaget: function() {
        return contextMenu.targetMenu;
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
          menuElement,
          fn = $parse(attrs.contextMenu),
          target = attrs.target,
          triggerOnEvent = attrs.triggerOnEvent || 'contextmenu',
          processEvent = $parse(attrs.processEvent)(scope) || angular.noop;

        /* target         is a mandatory attribute and used to bind a specific context
                          menu to the trigger event
           triggerOnEvent allows for binding the event for opening the menu to "click"
           processEvent   allows for patching event information, e.g. the target
                          position before opening the context menu */

        function open(event) {
          menuElement.css('top', Math.max(event.pageY, 0) + 'px');
          menuElement.css('left', Math.max(event.pageX, 0) + 'px');

          ContextMenuService.open(target);
        }

        function close() {
          ContextMenuService.close(target);
        }

        element.bind(triggerOnEvent, function(event) {
          if (!disabled) {
            menuElement = ContextMenuService.getMenuElement(target);

            /* Make sure the DOM is set before we try to find the menu - therefore if
               the element hasn't been registered try to look it up by its element id */
            if (!menuElement) {
              menuElement = angular.element(document.getElementById(target));
              ContextMenuService.registerMenuElement(target, menuElement);
            }

            openTarget = event.target;
            event.preventDefault();
            event.stopPropagation();

            scope.$apply(function() {
              // make the scope of the clicked element available
              ContextMenuService.setContext(scope);

              fn(scope, { $event: event });
              processEvent(event);
              open(event);
            });
          }
        });

        win.bind('keyup', function(event) {
          if (!disabled && ContextMenuService.opened() && event.keyCode === 27) {
            scope.$apply(function() {
              close();
            });
          }
        });

        function handleWindowClickEvent(event) {
          if (!disabled && ContextMenuService.opened() && (event.button !== 2 || event.target !== openTarget)) {
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

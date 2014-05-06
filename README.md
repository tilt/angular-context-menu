# [ng-context-menu](http://ianwalter.github.io/ng-context-menu/)
*An AngularJS directive to display a context menu when a right-click event is triggered*

#### Step 1: Install ng-context-menu

Install using Bower:

```
bower install ng-context-menu --save
```

Include ng-context-menu.min.js in your app.

#### Step 2: Load the ng-context-menu module

```javascript
var app = angular.module('menu-demo', ['ngRoute', 'ng-context-menu'])
```

#### Step 3: Add the context-menu directive to a DOM element

```html
<div context-menu class="panel panel-default" data-target="myMenu"
     ng-class="{ 'highlight': highlight, 'expanded' : expanded }">
  ...
</div>
```

You can access the scope of the clicked element by requiring the ContextMenuService, e.g.

```javascript
angular.module('myDirectives', ['ng-context-menu'])
.directive('contextMenuContainer', ['ContextMenuService', function(ContextMenuService) {
  return {
    link: function(scope, element, attrs) {
      ContextMenuService.setTarget(element);

      scope.contextMenu = ContextMenuService.getContextMenu();

      scope.$watch('contextMenu.opened', function(opened) {
        scope.opened = opened;
      });
    }
  };
};
```

**Note:** Make sure your dropdown menu has ```css position: fixed```

#### Disabling the contextmenu

If you need to disable the contextmenu in certain circumstances, you can add an expression to the
 ```context-menu-disabled``` attribute. If the expression evaluates to true, the contextmenu will be
 disabled, for example, ```context-menu-disabled="1 === 1"```

That's it, I hope you find this useful!

«–– [Ian](http://ianvonwalter.com)

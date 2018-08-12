angular
    .module('app.core').directive('dndHandle', function () {
        return function (scope, element, attr) {
            element.attr("draggable", "true");

            element.on('dragstart dragend', function (event) {
                event = event.originalEvent || event;
                event._dndHandle = true;
            });
        };
    });
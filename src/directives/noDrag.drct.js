angular
    .module('app.core').directive('dndNodrag', function () {
        return function (scope, element, attr) {
            // Set as draggable so that we can cancel the events explicitly
            element.attr("draggable", "true");

            /**
             * Since the element is draggable, the browser's default operation is to drag it on dragstart.
             * We will prevent that and also stop the event from bubbling up.
             */
            element.on('dragstart', function (event) {
                event = event.originalEvent || event;

                if (!event._dndHandle) {
                    // If a child element already reacted to dragstart and set a dataTransfer object, we will
                    // allow that. For example, this is the case for user selections inside of input elements.
                    if (!(event.dataTransfer.types && event.dataTransfer.types.length)) {
                        event.preventDefault();
                    }
                    event.stopPropagation();
                }
            });

            /**
             * Stop propagation of dragend events, otherwise dnd-moved might be triggered and the element
             * would be removed.
             */
            element.on('dragend', function (event) {
                event = event.originalEvent || event;
                if (!event._dndHandle) {
                    event.stopPropagation();
                }
            });
        };
    });

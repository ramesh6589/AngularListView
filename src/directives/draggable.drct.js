angular
    .module('app.core').directive('dndDraggable', ['$parse', '$timeout', function ($parse, $timeout) {
        return function (scope, element, attr) {
            element.attr("draggable", "true");
            if (attr.dndDisableIf) {
                scope.$watch(attr.dndDisableIf, function (disabled) {
                    element.attr("draggable", !disabled);
                });
            }
            element.on('dragstart', function (event) {
                event = event.originalEvent || event;
                if (element.attr('draggable') == 'false') return true;
                dndState.isDragging = true;
                dndState.itemType = attr.dndType && scope.$eval(attr.dndType).toLowerCase();
                dndState.dropEffect = "none";
                dndState.effectAllowed = attr.dndEffectAllowed || ALL_EFFECTS[0];
                event.dataTransfer.effectAllowed = dndState.effectAllowed;
                var item = scope.$eval(attr.dndDraggable);
                var mimeType = MIME_TYPE + (dndState.itemType ? ('-' + dndState.itemType) : '');
                try {
                    event.dataTransfer.setData(mimeType, angular.toJson(item));
                } catch (e) {
                    // Setting a custom MIME type did not work, we are probably in IE or Edge.
                    var data = angular.toJson({ item: item, type: dndState.itemType });
                    try {
                        event.dataTransfer.setData(EDGE_MIME_TYPE, data);
                    } catch (e) {
                        var effectsAllowed = filterEffects(ALL_EFFECTS, dndState.effectAllowed);
                        event.dataTransfer.effectAllowed = effectsAllowed[0];
                        event.dataTransfer.setData(MSIE_MIME_TYPE, data);
                    }
                }

                // Add CSS classes. See documentation above.
                element.addClass("dndDragging");
                $timeout(function () { element.addClass("dndDraggingSource"); }, 0);

                // Try setting a proper drag image if triggered on a dnd-handle (won't work in IE).
                if (event._dndHandle && event.dataTransfer.setDragImage) {
                    event.dataTransfer.setDragImage(element[0], 0, 0);
                }

                // Invoke dragstart callback and prepare extra callback for dropzone.
                $parse(attr.dndDragstart)(scope, { event: event });
                if (attr.dndCallback) {
                    var callback = $parse(attr.dndCallback);
                    dndState.callback = function (params) { return callback(scope, params || {}); };
                }

                event.stopPropagation();
            });

            /**
             * The dragend event is triggered when the element was dropped or when the drag
             * operation was aborted (e.g. hit escape button). Depending on the executed action
             * we will invoke the callbacks specified with the dnd-moved or dnd-copied attribute.
             */
            element.on('dragend', function (event) {
                event = event.originalEvent || event;

                // Invoke callbacks. Usually we would use event.dataTransfer.dropEffect to determine
                // the used effect, but Chrome has not implemented that field correctly. On Windows
                // it always sets it to 'none', while Chrome on Linux sometimes sets it to something
                // else when it's supposed to send 'none' (drag operation aborted).
                scope.$apply(function () {
                    var dropEffect = dndState.dropEffect;
                    var cb = { copy: 'dndCopied', link: 'dndLinked', move: 'dndMoved', none: 'dndCanceled' };
                    $parse(attr[cb[dropEffect]])(scope, { event: event });
                    $parse(attr.dndDragend)(scope, { event: event, dropEffect: dropEffect });
                });

                // Clean up
                dndState.isDragging = false;
                dndState.callback = undefined;
                element.removeClass("dndDragging");
                element.removeClass("dndDraggingSource");
                event.stopPropagation();

                // In IE9 it is possible that the timeout from dragstart triggers after the dragend handler.
                $timeout(function () { element.removeClass("dndDraggingSource"); }, 0);
            });

            /**
             * When the element is clicked we invoke the callback function
             * specified with the dnd-selected attribute.
             */
            element.on('click', function (event) {
                if (!attr.dndSelected) return;

                event = event.originalEvent || event;
                scope.$apply(function () {
                    $parse(attr.dndSelected)(scope, { event: event });
                });

                // Prevent triggering dndSelected in parent elements.
                event.stopPropagation();
            });

            /**
             * Workaround to make element draggable in IE9
             */
            element.on('selectstart', function () {
                if (this.dragDrop) this.dragDrop();
            });
        };
    }]);

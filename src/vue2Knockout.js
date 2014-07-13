
function setView2Data(element)
{
    var elt = $(element).parent()[0];
    while (elt != undefined && elt != null)
    {
        var view2 = $(elt).data('view2');
        if (view2 != undefined)
        {
            $(element).data('view2', view2);
            return view2;
        }
        elt = $(elt).parent()[0];
    }
    alert("view2 not found in DOM");
    return undefined;
}

vue2GetRelMouseCoords = function(currentElement, event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent);

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return [canvasX, canvasY];
}

//
// Center
//
ko.bindingHandlers.vue2Center =
{
    init:function(element, valueAccessor, allBindingsAccessor, viewModel)
    {
        // try to find vue2View in ancestors
        var view2 = setView2Data(element);

        var options = allBindingsAccessor().vue2Options || {};
        var constraint = allBindingsAccessor().vue2Constraint;

        if (options.draggable == true)
        {
            var dragStart = {};
            var dragStart2 = [0,0];
            $(element).draggable(
                {
                    start: function( event, ui ) {
                        if (viewModel.onDragStart != undefined)
                        {
                            viewModel.onDragStart();
                        }

                        var observable = valueAccessor();
                        dragStart2[0] = observable()[0];
                        dragStart2[1] = observable()[1];

                        dragStart.left = ui.position.left;
                        dragStart.top = ui.position.top;
                    },

                    drag: function( event, ui ) {
                        var options = allBindingsAccessor().vue2Options || {};
                        var observable = valueAccessor();

                        // constraint position by projecting on axis
                        if (options.axis != undefined)
                        {
                            var axis = [options.axis.left, options.axis.top];
                            var delta = [
                                ui.position.left - dragStart.left,
                                ui.position.top - dragStart.top
                            ];
                            var dot = delta[0]*axis[0] + delta[1]*axis[1];
                            dot /= (axis[0]*axis[0] + axis[1]*axis[1]);

                            ui.position.left = dragStart.left + dot*axis[0];
                            ui.position.top = dragStart.top + dot*axis[1];
                        }

                        // convert left,top to world coordinates
                        var left = ui.position.left + $(element).width() / 2;
                        var top = ui.position.top + $(element).height() / 2;

                        if (options.windowOffset && options.windowOffset.left) { left -= options.windowOffset.left; }
                        if (options.windowOffset && options.windowOffset.top)  { top -= options.windowOffset.top; }

                        var windowPos = [left, top];
                        var worldPos = [0,0];
                        view2.vecToWorld(windowPos, worldPos);

                        // apply constraint if needed
                        if (constraint)
                        {
                            var prox = $.proxy(constraint, viewModel);
                            prox(ui, {start:dragStart2, position:worldPos});

                            // convert back dest to ui.position
                            view2.vecToWindow(worldPos, windowPos);
                            left = windowPos[0] - $(element).width() / 2;
                            top = windowPos[1] - $(element).height() / 2;

                            if (options.windowOffset && options.windowOffset.left) { left += options.windowOffset.left; }
                            if (options.windowOffset && options.windowOffset.top)  { top += options.windowOffset.top; }

                            ui.position.left = left;
                            ui.position.top = top;
                        }

                        observable(worldPos);

                    },

                    stop: function( event, ui ) {
                        if (viewModel.onDragStop != undefined)
                        {
                            viewModel.onDragStop();
                        }
                    }
                }
            );

            //$(element).draggable( "option", "axis", "x" );
        }

        var callback = function()
        {
            ko.bindingHandlers.vue2Center.update(element, valueAccessor, allBindingsAccessor, viewModel);
        };
        view2.pushBoundChanged(element, callback);

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            view2.removeBoundChanged(element);
        });
    },

    update:function(element, valueAccessor, allBindingsAccessor, viewModel)
    {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var options = allBindingsAccessor().vue2Options || {};

        var view2 = $(element).data('view2');

        if (view2 != undefined)
        {
            var dest = [0,0];
            view2.vecToWindow(value, dest);

            var newTop = dest[1] - $(element).height() / 2;
            var newLeft = dest[0] - $(element).width() / 2;

            if (options.windowOffset && options.windowOffset.top)  { newTop += options.windowOffset.top; }
            if (options.windowOffset && options.windowOffset.left) { newLeft += options.windowOffset.left; }

            $(element).css({
                top: newTop,
                left: newLeft
            });
        }
    }
};


//
// View
//

ko.bindingHandlers.vue2View =
{
    init:function(element, valueAccessor, allBindingsAccessor, viewModel)
    {
        var observable = valueAccessor();
        var view2 = new vue2.view2();

        $(element).data('view2', view2);
        view2.setWindowSize($(element).width(), $(element).height());

        // Interactions
        var interactions = new vue2.view2Interactions();
        interactions.setView2(view2);

        $(element).mousewheel(function(e, delta)
        {
            var eoffsetX = (e.offsetX || e.clientX - $(e.target).offset().left + window.pageXOffset ),
                eoffsetY = (e.offsetY || e.clientY - $(e.target).offset().top + window.pageYOffset );

            interactions.zoomRelative(delta, [eoffsetX, eoffsetY]);
        });

/*
        $(window).bind('resize', function(event)
        {

            var oldWidth = view2.width;
            var oldHeight = view2.height;
            var newWidth = $(element).width();
            var newHeight = $(element).height();

            var boundsWidth = (view2.bounds.max[0] - view2.bounds.min[0]) * newWidth/oldWidth;
            var newBoundsMinX = view2.bounds.min[0];
            var newBoundsMaxX = view2.bounds.min[0] + boundsWidth;

            // compute height from width using height/width ratio
            var newBoundsHeight = boundsWidth * newHeight/newWidth;
            var newBoundsMinY = view2.bounds.min[1];
            var newBoundsMaxY = newBoundsMinY + newBoundsHeight;

            // update rectangle
            view2.setWindowSize(newWidth, newHeight);
            view2.setBounds4(newBoundsMinX, newBoundsMinY, newBoundsMaxX, newBoundsMaxY);

        });
*/
        /*
         var onMousedown = function(event)
         {
         $.proxy(interactions.onMousedown, interactions)(event);
         }

         var onMouseup = function(event)
         {
         $.proxy(interactions.onMouseup, interactions)(event);
         }

         var onMousemove = function(event)
         {
         $.proxy(interactions.onMousemove, interactions)(event);
         }
         */
        $(element).mousedown($.proxy(interactions.onMousedown, interactions));
        $(element).mouseup($.proxy(interactions.onMouseup, interactions));
        $(element).mousemove($.proxy(interactions.onMousemove, interactions));

        var callback = function()
        {
            observable.withPausing().sneakyUpdate(view2.bounds);
            if (viewModel.onRectangleChangedFromView)
            {
                viewModel.onRectangleChangedFromView();
            }
        }
        view2.pushBoundChanged(element, callback);


        ko.bindingHandlers.vue2View.update(element, valueAccessor, allBindingsAccessor, viewModel);
    },

    update:function(element, valueAccessor, allBindingsAccessor, viewModel)
    {
        console.log("View2 set bounds to view model");
        var value = ko.utils.unwrapObservable(valueAccessor());
        var view2 = $(element).data('view2');

        setTimeout(function() {
            view2.setBounds(value);
        }, 1);

    }
};

//
// Path
//
var vue2PointsDebugCounter = 0;

ko.bindingHandlers.vue2Points =
{
    init:function(element, valueAccessor, allBindingsAccessor, viewModel)
    {
        var view2 = setView2Data(element);
        vue2PointsDebugCounter++;
        //console.log("create points #" + vue2PointsDebugCounter);
        //$(element).data('vue2PointsDebugCounter', vue2PointsDebugCounter);

        var callback = function()
        {
            ko.bindingHandlers.vue2Points.update(element, valueAccessor, allBindingsAccessor, viewModel);
        };
        view2.pushBoundChanged(element, callback);

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            //var debugCounter = $(element).data('vue2PointsDebugCounter');
            //console.log("dispose points #" + debugCounter);
            view2.removeBoundChanged(element);
        });
    },

    update:function(element, valueAccessor, allBindingsAccessor, viewModel)
    {
        var view2 = $(element).data('view2');
        var debugCounter = $(element).data('vue2PointsDebugCounter');
        //console.log("update points #" + debugCounter);

        var path = element;
        var segments = path.pathSegList;
        segments.clear();

        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value.length <= 1)
        {
            return;
        }

        var dest = [0,0];
        view2.vecToWindow(value[0], dest);

        segments.appendItem(path.createSVGPathSegMovetoAbs(dest[0], dest[1]));

        var i,len = value.length;
        for (i = 1; i<len ; ++i)
        {
            view2.vecToWindow(value[i], dest);
            segments.appendItem(path.createSVGPathSegLinetoAbs(dest[0], dest[1]));
        }

    }
}

//
// Grid
//

ko.bindingHandlers.vue2Grid =
{
    init:function(element, valueAccessor, allBindingsAccessor, viewModel)
    {
        var view2 = setView2Data(element);

        var value = ko.utils.unwrapObservable(valueAccessor());
        var grid = new vue2.infiniteGrid2();
        grid.setDivSize(value.divSize);


        var doUpdate = function()
        {
            var view2 = $(element).data('view2');
            grid.setBounds(view2.bounds);

            var path = element;
            var segments = path.pathSegList;
            segments.clear();

            var dest = [0,0];
            var i,len = grid.lines.length;
            for (i=0; i<len; i+=2)
            {
                view2.vecToWindow(grid.lines[i], dest);
                segments.appendItem(path.createSVGPathSegMovetoAbs(dest[0], dest[1]));

                view2.vecToWindow(grid.lines[i+1], dest);
                segments.appendItem(path.createSVGPathSegLinetoAbs(dest[0], dest[1]));
            }
        }

        doUpdate();
        view2.pushBoundChanged(element, doUpdate);
    },

    update:function(element, valueAccessor, allBindingsAccessor, viewModel)
    {
    }
}

ko.observable.fn.withPausing = function() {
    this.notifySubscribers = function() {
        if (!this.pauseNotifications) {
            ko.subscribable.fn.notifySubscribers.apply(this, arguments);
        }
    };

    this.sneakyUpdate = function(newValue) {
        this.pauseNotifications = true;
        this(newValue);
        this.pauseNotifications = false;
    };

    return this;
};


//
// Bounds
//

ko.bindingHandlers.vue2Bounds =
{
    init:function(element, valueAccessor, allBindingsAccessor, viewModel)
    {
        var view2 = setView2Data(element);

        var callback = function()
        {
            ko.bindingHandlers.vue2Bounds.update(element, valueAccessor, allBindingsAccessor, viewModel);
        };
        view2.pushBoundChanged(element, callback);

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            view2.removeBoundChanged(element);
        });
    },

    update:function(element, valueAccessor, allBindingsAccessor, viewModel)
    {
        var view2 = $(element).data('view2');

        if (view2 != undefined)
        {
            var rect = ko.utils.unwrapObservable(valueAccessor());
            var bottomLeft = [0,0];
            var topRight = [0,0];
            view2.vecToWindow(rect.min, bottomLeft);
            view2.vecToWindow(rect.max, topRight);

            $(element).css({
                top: topRight[1],
                left: bottomLeft[0],
                width: topRight[0] - bottomLeft[0],
                height: bottomLeft[1] - topRight[1]
            });
        }


    }
}

//
// Mouse events
//

ko.bindingHandlers.vue2MouseMove =
{
    init:function(element, valueAccessor, allBindingsAccessor, viewModel)
    {
        var view2 = setView2Data(element);

        var value = ko.utils.unwrapObservable(valueAccessor());

        var callback = function(event)
        {
            var windowPos = vue2GetRelMouseCoords(element, event);
            var worldPos = [0,0];
            view2.vecToWorld(windowPos, worldPos);
            $.proxy(value, viewModel)(worldPos);
        }


        $(element).mousemove(callback);
    }
}

ko.bindingHandlers.vue2MouseDown =
{
    init:function(element, valueAccessor, allBindingsAccessor, viewModel)
    {
        var view2 = setView2Data(element);
        var value = ko.utils.unwrapObservable(valueAccessor());

        var callback = function(event)
        {
            var windowPos = vue2GetRelMouseCoords(element, event);
            var worldPos = [0,0];
            view2.vecToWorld(windowPos, worldPos);

            //console.log("window "+windowPos[0]+","+windowPos[1]);
            //console.log("world  "+worldPos[0]+","+worldPos[1]);
            $.proxy(value, viewModel)(worldPos);
        }

        $(element).mousedown(callback);
    }
}

ko.bindingHandlers.vue2MouseUp =
{
    init:function(element, valueAccessor, allBindingsAccessor, viewModel)
    {
        var view2 = setView2Data(element);
        var value = ko.utils.unwrapObservable(valueAccessor());

        var callback = function(event)
        {
            var windowPos = vue2GetRelMouseCoords(element, event);
            var worldPos = [0,0];
            view2.vecToWorld(windowPos, worldPos);

            //console.log("window "+windowPos[0]+","+windowPos[1]);
            //console.log("world  "+worldPos[0]+","+worldPos[1]);
            $.proxy(value, viewModel)(worldPos);
        }

        $(element).mouseup(callback);
    }
}
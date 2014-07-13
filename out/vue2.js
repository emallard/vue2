var vue2;
(function (vue2) {
    var infiniteGrid2 = (function () {
        function infiniteGrid2() {
            this.divSize = 1;
            this.lines = [];
        }
        infiniteGrid2.prototype.setDivSize = function (size) {
            this.divSize = size;
        };

        infiniteGrid2.prototype.setBounds = function (bounds) {
            this.lines = [];

            var xMin = bounds.min[0];
            var yMin = bounds.min[1];
            var xMax = bounds.max[0];
            var yMax = bounds.max[1];

            var xMin2 = xMin - (xMin % 0.001);
            var yMin2 = yMin - (yMin % 0.001);

            for (var x = xMin2; x < xMax; x += 0.001) {
                this.lines.push([x, yMin]);
                this.lines.push([x, yMax]);
            }

            for (var y = yMin2; y < yMax; y += 0.001) {
                this.lines.push([xMin, y]);
                this.lines.push([xMax, y]);
            }
        };
        return infiniteGrid2;
    })();
    vue2.infiniteGrid2 = infiniteGrid2;
})(vue2 || (vue2 = {}));
function setView2Data(element) {
    var elt = $(element).parent()[0];
    while (elt != undefined && elt != null) {
        var view2 = $(elt).data('view2');
        if (view2 != undefined) {
            $(element).data('view2', view2);
            return view2;
        }
        elt = $(elt).parent()[0];
    }
    alert("view2 not found in DOM");
    return undefined;
}

ko.bindingHandlers.vue2View = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var observable = valueAccessor();
        var view2 = new vue2.view2();

        $(element).data('view2', view2);
        view2.setWindowSize($(element).width(), $(element).height());

        var interactions = new vue2.view2Interactions();
        interactions.setView2(view2);

        $(element).mousewheel(function (e, delta) {
            var eoffsetX = (e.offsetX || e.clientX - $(e.target).offset().left + window.pageXOffset), eoffsetY = (e.offsetY || e.clientY - $(e.target).offset().top + window.pageYOffset);

            interactions.zoomRelative(delta, [eoffsetX, eoffsetY]);
        });

        $(element).mousedown($.proxy(interactions.onMousedown, interactions));
        $(element).mouseup($.proxy(interactions.onMouseup, interactions));
        $(element).mousemove($.proxy(interactions.onMousemove, interactions));

        var callback = function () {
        };
        view2.pushBoundChanged(element, callback);

        ko.bindingHandlers.vue2View.update(element, valueAccessor, allBindingsAccessor, viewModel, undefined);
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        console.log("View2 set bounds to view model");
        var value = ko.utils.unwrapObservable(valueAccessor());
        var view2 = $(element).data('view2');

        setTimeout(function () {
            view2.setBounds(value);
        }, 1);
    }
};

ko.bindingHandlers.vue2Grid = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var view2 = setView2Data(element);

        var value = ko.utils.unwrapObservable(valueAccessor());
        var grid = new vue2.infiniteGrid2();
        grid.setDivSize(value.divSize);

        var doUpdate = function () {
            var view2 = $(element).data('view2');
            grid.setBounds(view2.bounds);

            var path = element;
            var segments = path.pathSegList;
            segments.clear();

            var dest = [0, 0];
            var i, len = grid.lines.length;
            for (i = 0; i < len; i += 2) {
                view2.vecToWindow(grid.lines[i], dest);
                segments.appendItem(path.createSVGPathSegMovetoAbs(dest[0], dest[1]));

                view2.vecToWindow(grid.lines[i + 1], dest);
                segments.appendItem(path.createSVGPathSegLinetoAbs(dest[0], dest[1]));
            }
        };

        doUpdate();
        view2.pushBoundChanged(element, doUpdate);
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
    }
};

ko.bindingHandlers.vue2Center = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var view2 = setView2Data(element);

        var options = allBindingsAccessor().vue2Options || {};
        var constraint = allBindingsAccessor().vue2Constraint;

        if (options.draggable == true) {
            var dragStartLeft = 0;
            var dragStartTop = 0;
            var dragStart2 = [0, 0];
            $(element).draggable({
                start: function (event, ui) {
                    var observable = valueAccessor();
                    dragStart2[0] = observable()[0];
                    dragStart2[1] = observable()[1];

                    dragStartLeft = ui.position.left;
                    dragStartTop = ui.position.top;
                },
                drag: function (event, ui) {
                    var options = allBindingsAccessor().vue2Options || {};
                    var observable = valueAccessor();

                    if (options.axis != undefined) {
                        var axis = [options.axis.left, options.axis.top];
                        var delta = [
                            ui.position.left - dragStartLeft,
                            ui.position.top - dragStartTop
                        ];
                        var dot = delta[0] * axis[0] + delta[1] * axis[1];
                        dot /= (axis[0] * axis[0] + axis[1] * axis[1]);

                        ui.position.left = dragStartLeft + dot * axis[0];
                        ui.position.top = dragStartTop + dot * axis[1];
                    }

                    var left = ui.position.left + $(element).width() / 2;
                    var top = ui.position.top + $(element).height() / 2;

                    if (options.windowOffset && options.windowOffset.left) {
                        left -= options.windowOffset.left;
                    }
                    if (options.windowOffset && options.windowOffset.top) {
                        top -= options.windowOffset.top;
                    }

                    var windowPos = [left, top];
                    var worldPos = [0, 0];
                    view2.vecToWorld(windowPos, worldPos);

                    if (constraint) {
                        var prox = $.proxy(constraint, viewModel);
                        prox(ui, { start: dragStart2, position: worldPos });

                        view2.vecToWindow(worldPos, windowPos);
                        left = windowPos[0] - $(element).width() / 2;
                        top = windowPos[1] - $(element).height() / 2;

                        if (options.windowOffset && options.windowOffset.left) {
                            left += options.windowOffset.left;
                        }
                        if (options.windowOffset && options.windowOffset.top) {
                            top += options.windowOffset.top;
                        }

                        ui.position.left = left;
                        ui.position.top = top;
                    }

                    observable(worldPos);
                },
                stop: function (event, ui) {
                }
            });
        }

        var callback = function () {
            ko.bindingHandlers.vue2Center.update(element, valueAccessor, allBindingsAccessor, viewModel, null);
        };
        view2.pushBoundChanged(element, callback);

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            view2.removeBoundChanged(element);
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var options = allBindingsAccessor().vue2Options || {};

        var view2 = $(element).data('view2');

        if (view2 != undefined) {
            var dest = [0, 0];
            view2.vecToWindow(value, dest);

            var newTop = dest[1] - $(element).height() / 2;
            var newLeft = dest[0] - $(element).width() / 2;

            if (options.windowOffset && options.windowOffset.top) {
                newTop += options.windowOffset.top;
            }
            if (options.windowOffset && options.windowOffset.left) {
                newLeft += options.windowOffset.left;
            }

            $(element).css({
                top: newTop,
                left: newLeft
            });
        }
    }
};

ko.bindingHandlers.vue2Bounds = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var view2 = setView2Data(element);

        var callback = function () {
            ko.bindingHandlers.vue2Bounds.update(element, valueAccessor, allBindingsAccessor, viewModel, null);
        };
        view2.pushBoundChanged(element, callback);

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            view2.removeBoundChanged(element);
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var view2 = $(element).data('view2');

        if (view2 != undefined) {
            var rect = ko.utils.unwrapObservable(valueAccessor());
            var bottomLeft = [0, 0];
            var topRight = [0, 0];
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
};

ko.bindingHandlers.vue2Points = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var view2 = setView2Data(element);

        var callback = function () {
            ko.bindingHandlers.vue2Points.update(element, valueAccessor, allBindingsAccessor, viewModel, null);
        };
        view2.pushBoundChanged(element, callback);

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            view2.removeBoundChanged(element);
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var view2 = $(element).data('view2');

        var path = element;
        var segments = path.pathSegList;
        segments.clear();

        var value0 = ko.utils.unwrapObservable(valueAccessor());
        var value = value0;
        if (value.length <= 1) {
            return;
        }

        var dest = [0, 0];
        view2.vecToWindow(value[0], dest);

        segments.appendItem(path.createSVGPathSegMovetoAbs(dest[0], dest[1]));

        var i, len = value.length;
        for (i = 1; i < len; ++i) {
            view2.vecToWindow(value[i], dest);
            segments.appendItem(path.createSVGPathSegLinetoAbs(dest[0], dest[1]));
        }
    }
};
var vue2;
(function (vue2) {
    var rectangle2 = (function () {
        function rectangle2() {
            this.min = [0, 0];
            this.max = [0, 0];
        }
        Object.defineProperty(rectangle2.prototype, "width", {
            get: function () {
                return this.max[0] - this.min[0];
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(rectangle2.prototype, "height", {
            get: function () {
                return this.max[1] - this.min[1];
            },
            enumerable: true,
            configurable: true
        });

        rectangle2.prototype.set4 = function (minx, miny, maxx, maxy) {
            this.min[0] = minx;
            this.min[1] = miny;
            this.max[0] = maxx;
            this.max[1] = maxy;
        };

        rectangle2.prototype.copy = function (dest) {
            dest.min[0] = this.min[0];
            dest.min[1] = this.min[1];
            dest.max[0] = this.max[0];
            dest.max[1] = this.max[1];
        };
        return rectangle2;
    })();
    vue2.rectangle2 = rectangle2;
})(vue2 || (vue2 = {}));
var vue2;
(function (vue2) {
    var view2 = (function () {
        function view2() {
            this.width = 700;
            this.height = 700;
            this.bounds = new vue2.rectangle2();
            this.boundsChanged = [];
            this.windowVectorToWorld = function (v, dest) {
                var minX = this.bounds.min[0];
                var minY = this.bounds.min[1];
                var maxX = this.bounds.max[0];
                var maxY = this.bounds.max[1];

                dest[0] = v[0] / this.width * (maxX - minX);
                dest[1] = -v[1] / this.height * (maxY - minY);
            };
            this.bounds.set4(-1, -1, 2, 2);
            this.__uniqueId = view2.__uniqueIdCounter++;
        }
        view2.prototype.vecToWindow = function (w, dest) {
            var minX = this.bounds.min[0];
            var minY = this.bounds.min[1];
            var maxX = this.bounds.max[0];
            var maxY = this.bounds.max[1];

            var rx = (w[0] - minX) / (maxX - minX);
            var ry = (w[1] - minY) / (maxY - minY);

            var cx = rx * this.width;
            var cy = this.height * (1 - ry);

            dest[0] = cx;
            dest[1] = cy;
        };

        view2.prototype.vecToWorld = function (c, dest) {
            var minX = this.bounds.min[0];
            var minY = this.bounds.min[1];
            var maxX = this.bounds.max[0];
            var maxY = this.bounds.max[1];

            var rx = c[0] / this.width;
            var ry = 1 - c[1] / this.height;

            var wx = (1 - rx) * minX + rx * maxX;
            var wy = (1 - ry) * minY + ry * maxY;
            dest[0] = wx;
            dest[1] = wy;
        };

        view2.prototype.setWindowSize = function (width, height) {
            this.width = width;
            this.height = height;
        };

        view2.prototype.setBounds = function (bounds) {
            bounds.copy(this.bounds);
            this.boundsChanged.forEach(function (f) {
                return f.callback();
            });
        };

        view2.prototype.setBounds4 = function (minx, miny, maxx, maxy) {
            this.bounds.set4(minx, miny, maxx, maxy);
            this.boundsChanged.forEach(function (f) {
                return f.callback();
            });
        };

        view2.prototype.translateBounds = function (delta) {
            this.bounds.min[0] += delta[0];
            this.bounds.min[1] += delta[1];
            this.bounds.max[0] += delta[0];
            this.bounds.max[1] += delta[1];
        };

        view2.prototype.pushBoundChanged = function (tag, callback) {
            this.boundsChanged.push(new callbackWithTag(tag, callback));
        };

        view2.prototype.removeBoundChanged = function (tag) {
            var len = this.boundsChanged.length;
            for (var i = 0; i < len; ++i) {
                if (this.boundsChanged[i].tag == tag) {
                    this.boundsChanged.splice(i, 1);
                    return;
                }
            }
            console.error("removeBoundChanged not found");
        };
        view2.__uniqueIdCounter = 1;
        return view2;
    })();
    vue2.view2 = view2;

    var callbackWithTag = (function () {
        function callbackWithTag(tag, callback) {
            this.tag = tag;
            this.callback = callback;
        }
        return callbackWithTag;
    })();
    vue2.callbackWithTag = callbackWithTag;
})(vue2 || (vue2 = {}));
var vue2;
(function (vue2) {
    var view2Interactions = (function () {
        function view2Interactions() {
            this.isMouseDown = false;
            this.mouseStart = [0, 0];
            this.boundsStart = new vue2.rectangle2();
        }
        view2Interactions.prototype.setView2 = function (view2) {
            this.view2 = view2;
        };

        view2Interactions.prototype.zoomRelative = function (delta, mouseXY) {
            var cx = mouseXY[0];
            var cy = mouseXY[1];

            var coeff = delta > 0 ? 0.9 : 1.1;

            var minX = this.view2.bounds.min[0];
            var minY = this.view2.bounds.min[1];
            var maxX = this.view2.bounds.max[0];
            var maxY = this.view2.bounds.max[1];

            var w = [0, 0];

            this.view2.vecToWorld(mouseXY, w);

            var k = coeff * (maxX - minX);
            var newMinX = -1 * (k * cx / this.view2.width - w[0]);
            var newMaxX = k + newMinX;

            k = coeff * (maxY - minY);
            var newMinY = k * (cy / this.view2.height - 1) + w[1];
            var newMaxY = k + newMinY;

            this.view2.setBounds4(newMinX, newMinY, newMaxX, newMaxY);
        };

        view2Interactions.prototype.onMousedown = function (event) {
            if (event.which != 2) {
                return;
            }
            this.isMouseDown = true;

            this.mouseStart = this.getMouse();
            this.view2.bounds.copy(this.boundsStart);
        };

        view2Interactions.prototype.onMouseup = function (event) {
            if (event.which != 2) {
                return;
            }
            this.isMouseDown = false;
        };

        view2Interactions.prototype.onMousemove = function (event) {
            if (!this.isMouseDown) {
                return;
            }

            var mouse = this.getMouse();
            var windowDelta = [
                mouse[0] - this.mouseStart[0],
                mouse[1] - this.mouseStart[1]
            ];

            var viewDelta = [0, 0];
            this.view2.windowVectorToWorld(windowDelta, viewDelta);

            this.view2.setBounds4(this.boundsStart.min[0] - viewDelta[0], this.boundsStart.min[1] - viewDelta[1], this.boundsStart.max[0] - viewDelta[0], this.boundsStart.max[1] - viewDelta[1]);
        };

        view2Interactions.prototype.getMouse = function () {
            var eoffsetX = (event.offsetX || event.clientX), eoffsetY = (event.offsetY || event.clientY);
            return [eoffsetX, eoffsetY];
        };
        return view2Interactions;
    })();
    vue2.view2Interactions = view2Interactions;
})(vue2 || (vue2 = {}));
//# sourceMappingURL=vue2.js.map

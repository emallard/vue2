var vue2;
(function (vue2) {
    var appViewModel = (function () {
        function appViewModel() {
            this.rectangle = ko.observable();
            this.pos1 = ko.observable();
            this.pos2 = ko.observable();
            this.pos3 = ko.observable();
            this.pos4 = ko.observable();
            this.pos5 = ko.observable();
            this.points = ko.observable();
            this.imageBounds = ko.observable();
            this.pointsArray = ko.observableArray();
            this.rectangle(new vue2.rectangle2());
            this.rectangle().set4(-0.001, -0.001, 0.005, 0.005);

            this.pos1([0, 0]);
            this.pos2([0.001, 0.004]);
            this.pos3([0.004, 0.002]);
            this.pos4([0.0035, 0.000]);
            this.pos5([0.001, 0.000]);

            var self = this;
            var updateFunc = function () {
                var newPoints = [
                    self.pos1(),
                    self.pos2(),
                    self.pos3(),
                    self.pos4(),
                    self.pos5(),
                    self.pos1()
                ];
                self.points(newPoints);
            };
            this.pos1.subscribe(updateFunc);
            this.pos2.subscribe(updateFunc);
            this.pos3.subscribe(updateFunc);
            this.pos4.subscribe(updateFunc);
            this.pos5.subscribe(updateFunc);

            updateFunc();

            for (var i = 0; i < 3; ++i) {
                var newPoints2 = [
                    [0.001 * i + 0.0002, 0.0011],
                    [0.001 * (i + 1) - 0.0002, 0.0015],
                    [0.001 * i + 0.0002, 0.0019]
                ];
                this.pointsArray.push(newPoints2);
            }

            this.imageBounds(new vue2.rectangle2());
            this.imageBounds().set4(0.003, 0.003, 0.005, 0.005);
        }
        appViewModel.prototype.constraintPos5 = function (ui, dragData) {
            var start = dragData.start;
            var position = dragData.position;
            var angle = Math.atan2(position[1], position[0]);
            position[0] = 0.001 * Math.cos(angle);
            position[1] = 0.001 * Math.sin(angle);
        };

        appViewModel.prototype.onRemoveClick = function () {
            this.pointsArray.remove(this.pointsArray()[0]);
        };
        return appViewModel;
    })();
    vue2.appViewModel = appViewModel;
})(vue2 || (vue2 = {}));
//# sourceMappingURL=example.js.map

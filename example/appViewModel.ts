
///<reference path='libs/knockout.d.ts' />
///<reference path='../out/vue2.d.ts' />

module vue2
{
    export class appViewModel
    {

        rectangle = ko.observable<rectangle2>();
        pos1 = ko.observable<number[]>();
        pos2 = ko.observable<number[]>();
        pos3 = ko.observable<number[]>();
        pos4 = ko.observable<number[]>();
        pos5 = ko.observable<number[]>();
        points = ko.observable<number[][]>();
        imageBounds = ko.observable<rectangle2>();
        pointsArray=ko.observableArray<number[][]>();

        constructor()
        {
            this.rectangle(new rectangle2());
            this.rectangle().set4(-0.001,-0.001,0.005,0.005);

            this.pos1([0, 0]);
            this.pos2([0.001, 0.004]);
            this.pos3([0.004, 0.002]);
            this.pos4([0.0035, 0.000])
            this.pos5([0.001, 0.000])

            var self = this;
            var updateFunc = function()
            {
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


            // points array
            for (var i=0; i<3; ++i)
            {
                var newPoints2:number[][] = [
                    [0.001*i + 0.0002, 0.0011],
                    [0.001*(i+1) - 0.0002, 0.0015],
                    [0.001*i + 0.0002, 0.0019]
                ];
                this.pointsArray.push(newPoints2);
            }




            this.imageBounds(new rectangle2());
            this.imageBounds().set4(0.003,0.003,0.005,0.005);
        }

        constraintPos5(ui:any, dragData:any)
        {
            var start = dragData.start;
            var position = dragData.position;
            var angle = Math.atan2(position[1], position[0]);
            position[0] = 0.001*Math.cos(angle);
            position[1] = 0.001*Math.sin(angle);
        }

        onRemoveClick()
        {
            this.pointsArray.remove(this.pointsArray()[0]);
        }

    }
}

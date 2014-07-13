

module vue2
{

    export class infiniteGrid2
    {
        divSize:number = 1;
        lines:number[][]=[];

        setDivSize(size:number)
        {
            this.divSize = size;
        }

        setBounds(bounds:rectangle2)
        {
            this.lines = [];

            var xMin = bounds.min[0];
            var yMin = bounds.min[1];
            var xMax = bounds.max[0];
            var yMax = bounds.max[1];

            var xMin2 = xMin - (xMin % 0.001);
            var yMin2 = yMin - (yMin % 0.001);

            for (var x = xMin2; x < xMax ; x += 0.001)
            {
                this.lines.push([x, yMin]);
                this.lines.push([x, yMax]);
            }

            for (var y = yMin2; y < yMax ; y += 0.001)
            {
                this.lines.push([xMin, y]);
                this.lines.push([xMax, y]);
            }
        }
    }

}
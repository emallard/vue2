

module vue2
{
    export class rectangle2
    {
        min = [0,0];
        max = [0,0];

        get width()
        {
            return this.max[0] - this.min[0];
        }

        get height()
        {
            return this.max[1] - this.min[1];
        }

        set4(minx:number, miny:number , maxx:number, maxy:number)
        {
            this.min[0] = minx;
            this.min[1] = miny;
            this.max[0] = maxx;
            this.max[1] = maxy;
        }

        copy(dest:rectangle2)
        {
            dest.min[0] = this.min[0];
            dest.min[1] = this.min[1];
            dest.max[0] = this.max[0];
            dest.max[1] = this.max[1];
        }
    }
}

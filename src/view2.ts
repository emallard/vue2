
module vue2
{

    export class view2
    {
        width:number = 700;
        height:number = 700;
        public bounds = new rectangle2();
        private boundsChanged:callbackWithTag[] = [];
        static __uniqueIdCounter = 1;
        private __uniqueId:number

        constructor()
        {
            this.bounds.set4(-1,-1,2,2);
            this.__uniqueId = view2.__uniqueIdCounter++;
        }

        vecToWindow(w:number[], dest:number[])
        {
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
        }

        vecToWorld(c:number[], dest:number[])
        {
            var minX = this.bounds.min[0];
            var minY = this.bounds.min[1];
            var maxX = this.bounds.max[0];
            var maxY = this.bounds.max[1];

            var rx = c[0] / this.width;
            var ry = 1 - c[1] / this.height;

            var wx = (1-rx) * minX + rx * maxX;
            var wy = (1-ry) * minY + ry * maxY;
            dest[0] = wx;
            dest[1] = wy;
        }


        windowVectorToWorld = function(v:number[], dest:number[])
        {
            var minX = this.bounds.min[0];
            var minY = this.bounds.min[1];
            var maxX = this.bounds.max[0];
            var maxY = this.bounds.max[1];

            dest[0] = v[0] / this.width * (maxX - minX);
            dest[1] = - v[1] / this.height * (maxY - minY);
        }


        setWindowSize(width:number, height:number)
        {
            this.width = width;
            this.height = height;
        }

        setBounds(bounds:rectangle2)
        {
            bounds.copy(this.bounds);
            this.boundsChanged.forEach((f) => f.callback());
        }

        setBounds4(minx:number, miny:number , maxx:number, maxy:number)
        {
            this.bounds.set4(minx, miny, maxx, maxy);
            this.boundsChanged.forEach((f) => f.callback());
        }

        translateBounds(delta:number[])
        {
            this.bounds.min[0] += delta[0];
            this.bounds.min[1] += delta[1];
            this.bounds.max[0] += delta[0];
            this.bounds.max[1] += delta[1];
        }

        pushBoundChanged(tag:any, callback:()=>void)
        {
            //console.log("push BoundChanged to view " + this.__uniqueId);
            this.boundsChanged.push(new callbackWithTag(tag, callback));
        }

        removeBoundChanged(tag:any)
        {
            var len = this.boundsChanged.length;
            for (var i=0; i<len; ++i)
            {
                if (this.boundsChanged[i].tag == tag)
                {
                    this.boundsChanged.splice(i, 1);
                    return;
                }
            }
            console.error("removeBoundChanged not found");
        }
    }


    export class callbackWithTag
    {
        tag:any;
        callback:()=>void;
        constructor(tag:any, callback:()=>void)
        {
            this.tag = tag;
            this.callback = callback;
        }
    }
}

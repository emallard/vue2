
module vue2
{

    export class view2Interactions
    {
        view2:view2;

        setView2(view2:view2)
        {
            this.view2 = view2;
        }

        zoomRelative(delta:number, mouseXY:number[])
        {
            var cx = mouseXY[0];
            var cy = mouseXY[1];

            var coeff = delta > 0 ? 0.9 : 1.1;

            var minX = this.view2.bounds.min[0];
            var minY = this.view2.bounds.min[1];
            var maxX = this.view2.bounds.max[0];
            var maxY = this.view2.bounds.max[1];

            var w = [0,0];

            this.view2.vecToWorld(mouseXY, w);

            var k = coeff*(maxX - minX);
            var newMinX = -1*(k*cx/this.view2.width - w[0]);
            var newMaxX = k + newMinX;

            k = coeff*(maxY - minY);
            var newMinY = k*(cy/this.view2.height-1) + w[1];
            var newMaxY = k + newMinY;

            this.view2.setBounds4(newMinX, newMinY, newMaxX, newMaxY);
        }

        isMouseDown = false;
        mouseStart = [0,0];
        boundsStart = new vue2.rectangle2();
        onMousedown(event:any)
        {
            if (event.which != 2)
            {
                return;
            }
            this.isMouseDown = true;


            this.mouseStart = this.getMouse() ;
            this.view2.bounds.copy(this.boundsStart);
        }

        onMouseup(event:any)
        {
            if (event.which != 2)
            {
                return;
            }
            this.isMouseDown = false;
        }

        onMousemove(event:any)
        {
            if (!this.isMouseDown)
            {
                return;
            }

            var mouse = this.getMouse();
            var windowDelta = [
                mouse[0] - this.mouseStart[0],
                mouse[1] - this.mouseStart[1]
            ];

            var viewDelta = [0,0];
            this.view2.windowVectorToWorld(windowDelta, viewDelta);

            this.view2.setBounds4(
                this.boundsStart.min[0] - viewDelta[0],
                this.boundsStart.min[1] - viewDelta[1],
                this.boundsStart.max[0] - viewDelta[0],
                this.boundsStart.max[1] - viewDelta[1]
            );
        }

        getMouse()
        {
            var eoffsetX = (event.offsetX || event.clientX),
                eoffsetY = (event.offsetY || event.clientY);
            return [eoffsetX, eoffsetY];
        }
    }
}

declare module vue2 {
    class infiniteGrid2 {
        public divSize: number;
        public lines: number[][];
        public setDivSize(size: number): void;
        public setBounds(bounds: rectangle2): void;
    }
}
interface KnockoutBindingHandlers {
    vue2View: KnockoutBindingHandler;
    vue2Grid: KnockoutBindingHandler;
    vue2Center: KnockoutBindingHandler;
    vue2Bounds: KnockoutBindingHandler;
    vue2Points: KnockoutBindingHandler;
}
declare function setView2Data(element: any): any;
declare module vue2 {
    class rectangle2 {
        public min: number[];
        public max: number[];
        public width : number;
        public height : number;
        public set4(minx: number, miny: number, maxx: number, maxy: number): void;
        public copy(dest: rectangle2): void;
    }
}
declare module vue2 {
    class view2 {
        public width: number;
        public height: number;
        public bounds: rectangle2;
        private boundsChanged;
        static __uniqueIdCounter: number;
        private __uniqueId;
        constructor();
        public vecToWindow(w: number[], dest: number[]): void;
        public vecToWorld(c: number[], dest: number[]): void;
        public windowVectorToWorld: (v: number[], dest: number[]) => void;
        public setWindowSize(width: number, height: number): void;
        public setBounds(bounds: rectangle2): void;
        public setBounds4(minx: number, miny: number, maxx: number, maxy: number): void;
        public translateBounds(delta: number[]): void;
        public pushBoundChanged(tag: any, callback: () => void): void;
        public removeBoundChanged(tag: any): void;
    }
    class callbackWithTag {
        public tag: any;
        public callback: () => void;
        constructor(tag: any, callback: () => void);
    }
}
declare module vue2 {
    class view2Interactions {
        public view2: view2;
        public setView2(view2: view2): void;
        public zoomRelative(delta: number, mouseXY: number[]): void;
        public isMouseDown: boolean;
        public mouseStart: number[];
        public boundsStart: rectangle2;
        public onMousedown(event: any): void;
        public onMouseup(event: any): void;
        public onMousemove(event: any): void;
        public getMouse(): number[];
    }
}

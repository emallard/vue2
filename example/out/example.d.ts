/// <reference path="../libs/knockout.d.ts" />
/// <reference path="../../out/vue2.d.ts" />
declare module vue2 {
    class appViewModel {
        public rectangle: KnockoutObservable<rectangle2>;
        public pos1: KnockoutObservable<number[]>;
        public pos2: KnockoutObservable<number[]>;
        public pos3: KnockoutObservable<number[]>;
        public pos4: KnockoutObservable<number[]>;
        public pos5: KnockoutObservable<number[]>;
        public points: KnockoutObservable<number[][]>;
        public imageBounds: KnockoutObservable<rectangle2>;
        public pointsArray: KnockoutObservableArray<number[][]>;
        constructor();
        public constraintPos5(ui: any, dragData: any): void;
        public onRemoveClick(): void;
    }
}

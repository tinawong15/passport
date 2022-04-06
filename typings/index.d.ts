/// <reference path="modules/firebase/index.d.ts" />
/// <reference types="jquery" />
interface TurnOptions {
    acceleration?: boolean;
    autoCenter?: boolean;
    direction?: string;
    display?: number;
    duration?: number;
    gradients?: boolean;
    height?: number;
    elevation?: number;
    page?: number;
    pages?: number;
    turnCorners?: string;
    when?: {     
        end?: (event: any, page: any, pageObject: any) => void;
        first?: (event: any, page: any, pageObject: any) => void;
        last?: (event: any, page: any, pageObject: any) => void;
        missing?: (event: any, page: any, pageObject: any) => void;
        start?: (event: any, page: any, pageObject: any) => void;
        turning?: (event: any, page: any, pageObject: any) => void;
        turned?: (event: any, page: any, pageObject: any) => void;
        zooming?: (event: any, page: any, pageObject: any) => void;
    }
    width?: number;
}
interface ZoomOptions {     
    easeFunction?: 'default'|'linear'|'ease-in'|'ease-out'|'ease-in-out'|'cubic bezier';
    duration?: number;
    max?: number|(()=>number);
    flipbook?: JQuery;
    when?:{
        doubleTap?:any;
        resize?:any;
        swipeLeft?:any;
        swipeRight?:any;
        tap?:any;
        zoomIn?:any;
        zoomOut?:any;
    }
}
interface JQuery {
    turn(options:TurnOptions):void;
    turn(method:string, ...args:any):void;
    zoom(options:ZoomOptions):void;
}
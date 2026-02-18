import {Application} from "pixi.js";
import {debounceFunc, isNumber} from "../Utils/utils.ts";


export class Resizer {
    private _app: Application;

    private _designWidth: number;
    private _designHeight: number;
    private _designAspectRatio: number;

    private _resizeActions: ((w: number, h: number) => void)[];

    private _realWidth: number = -1;
    private _realHeight: number = -1;

    private _started: boolean = false;


    public get designAspectRatio(): number {
        return this._designAspectRatio;
    }

    public get realWidth(): number { return this._realWidth; }
    public get realHeight(): number { return this._realHeight }

    public get canvasWidth(): number { return this._app.canvas.width; }
    public get canvasHeight(): number { return this._app.canvas.height; }


    public constructor(app: Application, designSize: { x: number, y: number }) {
        this._app = app;

        this._designWidth = designSize.x;
        this._designHeight = designSize.y;
        this._designAspectRatio = this._designWidth / this._designHeight;

        this._resizeActions = [];
    }


    public startProcess() {
        this.resize();

        if (!this._started)
            window.addEventListener("resize", debounceFunc(() => {
                this.resize();
            }));
        this._started = true;
    }

    public stopProcess() {
        if (this._started)
            window.removeEventListener("resize", debounceFunc(() => {
                this.resize();
            }));
        this._started = false;
    }


    public addResizeAction(action: (w: number, h: number) => void): number {
        action(this.realWidth, this.realHeight);
        return this._resizeActions.push(action);
    }

    public removeResizeAction(action: (w: number, h: number) => void): void;
    public removeResizeAction(actionID: number): void;
    public removeResizeAction(arg: ((w: number, h: number) => void) | number) {
        const actionID: number = isNumber(arg)
            ? arg as number
            : this._resizeActions.indexOf(arg as (w: number, h: number) => void);
        this._resizeActions.splice(actionID, 1);
    }


    public resize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const windowAspect = windowWidth / windowHeight;

        let newWidth, newHeight;
        if (windowAspect > this._designAspectRatio) {
            newHeight = windowHeight;
            newWidth = newHeight * this._designAspectRatio;
        } else {
            newWidth = windowWidth;
            newHeight = newWidth / this._designAspectRatio;
        }

        this._app.renderer.resize(
            windowWidth,
            windowHeight
        );

        this._app.stage.scale.set(
            newWidth / this._designWidth,
            newHeight / this._designHeight
        );

        this._realWidth = windowWidth / this._app.stage.scale.x;
        this._realHeight = windowHeight / this._app.stage.scale.y;

        this._resizeActions.forEach(action => action(this._realWidth, this._realHeight));
    }
}
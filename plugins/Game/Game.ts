import {Application, Container} from "pixi.js";
import {Resizer} from "./Resizer.ts";
import sdk from "@smoud/playable-sdk";
import {UI} from "./UI.ts";
import {GameConfig} from "./GameConfig.ts";
import {InstallAdapters} from "../Builder/Adapters.ts";


export class Game {
    private static _INSTANCE: Game;

    public _config: GameConfig;

    private _app: Application;
    private _resizer: Resizer;
    private _ui: UI;

    private _container!: Container;


    public static get I(): Game {  return Game._INSTANCE; }

    public get config(): GameConfig { return this._config; }

    public get app(): Application {
        return this._app;
    }

    public get resizer(): Resizer {
        return this._resizer;
    }

    public get container(): Container {
        return this._container;
    }

    public get ui(): UI {
        return this._ui;
    }


    constructor(config: GameConfig) {
        if (Game._INSTANCE)
            throw new Error("Game is already initialized");

        Game._INSTANCE = this;

        this._config = config;

        this._app = new Application();
        this._resizer = new Resizer(this._app, this.config.designSize);

        this._container = new Container();
        this._ui = new UI(this);
    }

    public setGameResizeTarget(level: Container) {
        this._resizer.addResizeAction(() => {
            this._container.scale.set(Math.max(
                1,
                this._resizer.realWidth / level.width,
                this._resizer.realHeight / level.height
            ));
        });
    }


    public async initialise() {
        console.log("Initializing...");

        sdk.init(async () => {
            await InstallAdapters();

            sdk.start();
        });

        await this._app.init({
            background: this.config.background,
            width: this.config.designSize.x,
            height: this.config.designSize.y,
            autoDensity: true,
            resolution: window.devicePixelRatio || 1,
        });
        document.getElementById("pixi-container")!.appendChild(this._app.canvas);

        this._app.stage.addChild(this._container);
        this._app.stage.addChild(this._ui.container);

        this._resizer.startProcess();
    }

    public async resize() {
        this._resizer.resize();
    }
}

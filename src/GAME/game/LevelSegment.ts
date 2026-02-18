import {Assets, Color, Container, Graphics, Sprite, Texture} from "pixi.js";
import {GAME_CONFIG} from "../../game.config.ts";
import {Hatch} from "./Hatch.ts";
import {Barrier} from "./Barrier.ts";
import {Car} from "./Car.ts";
import {APP_CONFIG} from "../../config.ts";
import {AssetsDB} from "../../../plugins/Assets/_DATA_BASE/AssetsDB.ts";

export class LevelSegment extends Container {
    public readonly value: number;

    private _value_view: string | null;

    private hatch!: Hatch;
    private barrier!: Barrier;
    private car!: Car;

    constructor(value: number, value_view: string | null) {
        super();

        this.value = value;
        this._value_view = value_view;

        this.createView();
    }

    private _root!: Container;

    public get root(): Container {
        return this._root;
    }

    public get Available(): boolean {
        return this.car.isRacing;
    }

    public complete() {
        this.hatch.complete(GAME_CONFIG.level.hatchDuration);
    }

    public activate() {
        this.hatch.complete(GAME_CONFIG.level.hatchDuration);

        this.barrier.show(
            GAME_CONFIG.level.barrierPos,
            GAME_CONFIG.level.carDuration / 4
        );

        this.car.rideFromTo(
            -APP_CONFIG.designSize.y / 2 - this.car.height,
            -GAME_CONFIG.level.carPos,
            GAME_CONFIG.level.carDuration / 2
        );
    }

    public target() {
        this.hatch.activate();

        this.rideCarThrow();
    }

    public deactivate() {
        this.hatch.deactivate();
        this.barrier.hide();
        this.car.hide();
    }

    public rideCarThrow() {
        this.car.rideFromTo(
            -APP_CONFIG.designSize.y / 2 - this.car.height,
            APP_CONFIG.designSize.y / 2 + this.car.height,
            GAME_CONFIG.level.carDuration,
            true
        );
    }


    private createView() {
        const dividerAsset: Texture = Assets.get(AssetsDB.texture.level_divider);

        const divider = new Sprite(dividerAsset);
        divider.anchor.set(1, .5);
        divider.position.set(this.width, 0);
        this.addChild(divider);

        const backgroundWidth = GAME_CONFIG.level.segmentSize - divider.width;
        const background = new Graphics()
            .rect(0, 0, backgroundWidth, 10)
            .fill(new Color("rgba(0,0,0,0)"));
        this.addChild(background);

        this._root = new Container();
        this._root.x = backgroundWidth / 2;
        this.addChild(this._root);

        this.hatch = new Hatch(this._value_view ?? this.value.toString());
        this._root.addChild(this.hatch);

        this.car = new Car(GAME_CONFIG.level.segmentSize * .75);
        this._root.addChild(this.car);

        this.barrier = new Barrier(GAME_CONFIG.level.segmentSize * .75);
        this.barrier.y = -GAME_CONFIG.level.barrierPos;
        this._root.addChild(this.barrier);
    }
}
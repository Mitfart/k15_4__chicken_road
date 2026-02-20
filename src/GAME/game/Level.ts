import {Assets, Container, Graphics, Sprite, Texture} from "pixi.js";
import {LevelConfig} from "./game.types.ts";
import {LEVEL_CONFIG} from "../../game.config.ts";
import {LevelSegment} from "./LevelSegment.ts";
import {random, randomInt} from "../../../plugins/Utils/utils.ts";
import {APP_CONFIG} from "../../config.ts";
import {AssetsDB} from "../../../plugins/Assets/_DATA_BASE/AssetsDB.ts";

export class Level extends Container {
    public currentSegmentID: number = 0;
    private _config: LevelConfig;
    private segments: LevelSegment[] = [];

    private startContainer!: Container;
    private finishContainer!: Container;

    constructor(cfg: LevelConfig = LEVEL_CONFIG) {
        super();

        this._config = cfg;

        this.createView();
        this.createMask();
        this.reset();
    }

    public get length(): number {
        return this.segments.length + 2; /* +Start and +Finish */
    }

    public get currentPosition() {
        return this.currentSegmentID <= 0 ? this.startPosition
            : this.currentSegmentID >= this.length ? this.finishPosition
                : this.startPosition + this._config.segmentSize * this.currentSegmentID;
    }

    public get startPosition() {
        return this._config.startSize + this._config.spawnOffset;
    }

    public get finishPosition() {
        return this.startPosition
            + this._config.segmentSize * this.segments.length
            + this._config.finishOffset / 2;
    }

    public get prevSegment(): LevelSegment | null {
        return this.getSegment(this.currentSegmentID - 1);
    }

    public get currentSegment(): LevelSegment | null {
        return this.getSegment(this.currentSegmentID);
    }

    public get nextSegment(): LevelSegment | null {
        return this.getSegment(this.currentSegmentID + 1);
    }


    public getSegment(id: number): LevelSegment | null {
        id -= 1; // CONVERT ID INTO INDEX
        return 0 <= id && id < this.segments.length ? this.segments[id] : null;
    }

    public reset() {
        this.segments.forEach(seg => seg.deactivate());
    }

    public startRandomDriveThrow(chance: number = .25) {
        setInterval(() => {
            if (random(0, 1) <= chance)
                this.getSegment(randomInt(this.currentSegmentID + 2, this.length))?.rideCarThrow();
        }, 100);
    }


    private createMask() {
        const mask = this.addChild(new Graphics()
            .rect(0, -this.height / 2, this.width, this.height)
            .fill("#fff")
        );

        this.segments.forEach(seg => {
            seg.mask = mask;
        });
    }

    private createView() {
        let targetPos = 0;

        this.createStart().position.set(targetPos, 0);
        targetPos += this._config.startSize;

        for (let i = 0; i < this._config.values.length; i++) {
            this.createSegment(
                this._config.values[i],
                this._config.values_view[i]
            ).position.set(targetPos, 0);
            targetPos += this._config.segmentSize;
        }

        targetPos += this._config.finishOffset;
        this.createFinish().position.set(targetPos, 0);
    }


    private createSegment(value: number, value_view:string | null = null): LevelSegment {
        const view = this.addChild(new LevelSegment(value, value_view));
        this.segments.push(view);
        return view;
    }

    private createStart() {
        const asset: Texture = Assets.get(AssetsDB.texture.level_start);

        this.startContainer = this.addChild(new Container());
        this.startContainer.position.set(this.width, 0);

        if (asset) {
            const sprite = new Sprite(asset);
            sprite.anchor.set(0, .5);
            this.startContainer.addChild(sprite);
        } else {
            this.startContainer.addChild(new Graphics()
                .rect(0, -APP_CONFIG.designSize.y / 2, this._config.startSize, APP_CONFIG.designSize.y)
                .fill("blue"));
        }

        return this.startContainer;
    }

    private createFinish() {
        const asset: Texture = Assets.get(AssetsDB.texture.level_finish);

        this.finishContainer = this.addChild(new Container());
        this.finishContainer.position.set(this.width, 0);

        if (asset) {
            const sprite = new Sprite(asset);
            sprite.anchor.set(0, .5);
            this.finishContainer.addChild(sprite);
        } else {
            this.finishContainer.addChild(new Graphics()
                .rect(0, -APP_CONFIG.designSize.y / 2, this._config.startSize, APP_CONFIG.designSize.y)
                .fill("red"));
        }

        return this.finishContainer;
    }
}
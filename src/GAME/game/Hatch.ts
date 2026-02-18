import * as PIXI from "pixi.js";
import {Assets, Sprite, Text} from "pixi.js";
import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import {APP_CONFIG} from "../../config.ts";
import {AssetsDB} from "../../../plugins/Assets/_DATA_BASE/AssetsDB.ts";

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

const fontFamily = APP_CONFIG.fontFamily;

export class Hatch extends Sprite {
    private _txt!: Text;


    constructor(txt: string) {
        super();

        this.anchor.set(.5);

        this._txt = this.addChild(new Text({
            text: txt,
            style: {
                fontFamily: fontFamily,
                fontSize: 50,
                fill: "#fff"
            },
            anchor: { x: .5, y: .65 },
        }));

        this.deactivate();
    }

    public deactivate() {
        this.texture = Assets.get(AssetsDB.texture.hatch_deactive);
        this._txt.visible = true;
    }

    public activate() {
        this.texture = Assets.get(AssetsDB.texture.hatch_active);
    }

    public complete(duration: number) {
        this.texture = Assets.get(AssetsDB.texture.hatch_complete);
        this._txt.visible = false;

        gsap.timeline()
            .to(this, {
                duration: duration / 2,
                pixi: {
                    scaleX: 0
                },
            }).to(this, {
            duration: duration / 2,
            pixi: {
                scaleX: 1,
            },
        });
    }
}
import {Assets, Sprite} from "pixi.js";
import {gsap} from "gsap";
import {AssetsDB} from "../../../plugins/Assets/_DATA_BASE/AssetsDB.ts";

export class Barrier extends Sprite {
    constructor(requiredWidth: number) {
        super();

        this.texture = Assets.get(AssetsDB.texture.barrier);
        this.anchor.set(.5, 1);

        this.scale.set(requiredWidth / this.width);
    }

    public show(at: number, duration: number) {
        this.visible = true;

        this.y = at - this.height * 5;
        gsap.to(this, {
            duration: duration,
            y: -at,
        });

    }

    public hide() {
        this.visible = false;
    }
}
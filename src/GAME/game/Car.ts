import {AnimatedSprite, Assets, Container} from "pixi.js";

import {gsap} from "gsap";
import {randomFrom} from "../../../plugins/Utils/utils.ts";
import {AssetsDB} from "../../../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import {sound} from "@pixi/sound";

export class Car extends Container {
    constructor(requiredWidth: number) {
        super();

        const vars = Assets.get(AssetsDB.data.cars).animations;

        const randomCar = vars[randomFrom(Object.keys(vars))];
        const view = AnimatedSprite.fromFrames(randomCar);
        view.anchor.set(0.5, 1);
        this.addChild(view);

        this.pivot.set(.5, 1);
        this.scale.set(requiredWidth / this.width);
    }

    private _isRacing: boolean = false;

    public get isRacing(): boolean {
        return this._isRacing;
    }

    public async rideFromTo(from: number, to: number, duration: number, hideOnComplete: boolean = false) {
        this.visible = true;
        this._isRacing = true;

        sound.play(AssetsDB.audio.car);

        setTimeout(() => {
            this._isRacing = false;
        }, duration * 1000 * .1);

        this.y = from;
        await gsap.to(this, {
            duration: duration,
            y: to,
            onComplete: () => {
                sound.stop(AssetsDB.audio.car);

                if (hideOnComplete) this.hide();
            }
        });
    }

    public hide() {
        this.visible = false;
    }
}
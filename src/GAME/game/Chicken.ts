import {AnimatedSprite, Assets, Container} from "pixi.js";

import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import {AssetsDB} from "../../../plugins/Assets/_DATA_BASE/AssetsDB.ts";

gsap.registerPlugin(PixiPlugin);

export class Chicken extends Container {
    public idleView!: AnimatedSprite;
    public jumpView!: AnimatedSprite;

    private _jumpHeight: number;
    private _jumpDuration: number;

    constructor(jumpHeight: number, jumpDuration: number) {
        super();
        this._jumpHeight = jumpHeight;
        this._jumpDuration = jumpDuration;

        this.createView();
    }

    private _isJumping: boolean = false;

    public get isJumping(): boolean {
        return this._isJumping;
    }

    public jumpTo(x: number, y: number, onComplete: () => void = () => {
    }) {
        const duration = this._jumpDuration;

        this._isJumping = true;

        this.jumpView.visible = true;
        this.idleView.visible = false;

        this.jumpView.animationSpeed = this._jumpDuration / 2;
        this.jumpView.currentFrame = 0;

        this.jumpView.play();
        this.idleView.stop();

        gsap.to(this, {
            duration: duration,
            x: x,
            ease: "power1.inOut",
            onComplete: () => {
                this._isJumping = false;

                this.jumpView.visible = false;
                this.idleView.visible = true;

                this.idleView.play();
                this.jumpView.stop();
                onComplete();
            },
        });
        gsap.to(this, {
            duration: duration / 2,
            y: y - this._jumpHeight,
            ease: "power1.out"
        }).then(() => {
            gsap.to(this, {
                duration: duration / 2,
                y: y,
                ease: "power1.in"
            })
        });
    }


    private createView() {
        const origin = {x: .75, y: .75};

        this.scale.set(.5);

        const animations = Assets.get(AssetsDB.data.chicken).animations;
        this.idleView = this.addChild(AnimatedSprite.fromFrames(animations["idle"]));
        this.idleView.anchor.set(origin.x, origin.y);
        this.idleView.visible = true;
        this.idleView.animationSpeed = 1 / 5;
        this.idleView.play();

        this.jumpView = this.addChild(AnimatedSprite.fromFrames(animations["jump"]));
        this.jumpView.anchor.set(origin.x, origin.y);
        this.jumpView.visible = false;
    }
}
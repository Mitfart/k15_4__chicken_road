import {AnimatedSprite, Assets, Container, Sprite, Text} from "pixi.js";

import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import {AssetsDB} from "../../../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import {APP_CONFIG} from "../../config.ts";
import {sound} from "@pixi/sound";

gsap.registerPlugin(PixiPlugin);

export class Chicken extends Container {
    private idleView!: AnimatedSprite;
    private jumpView!: AnimatedSprite;
    private winView!: AnimatedSprite;

    private _balanceBlock!: Container;
    private _balanceTxt!: Text;

    private _jumpHeight: number;
    private _jumpDuration: number;

    private _isJumping: boolean = false;

    public get isJumping(): boolean {
        return this._isJumping;
    }

    public get balanceTxt(): Text {
        return this._balanceTxt;
    }

    public get balanceBlock(): Container {
        return this._balanceBlock;
    }


    constructor(jumpHeight: number, jumpDuration: number) {
        super();
        this._jumpHeight = jumpHeight;
        this._jumpDuration = jumpDuration;

        this.createView();
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

        sound.play(AssetsDB.audio.jump);

        gsap.to(this, {
            duration: duration,
            x: x,
            ease: "power1.inOut",
            onComplete: () => {
                sound.stop(AssetsDB.audio.jump);

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
        this.idleView.animationSpeed = 1 / animations["idle"].length;
        this.idleView.play();

        this.jumpView = this.addChild(AnimatedSprite.fromFrames(animations["jump"]));
        this.jumpView.anchor.set(origin.x, origin.y);
        this.jumpView.visible = false;

        this.winView = this.addChild(AnimatedSprite.fromFrames(animations["win"]));
        this.winView.anchor.set(origin.x, origin.y);
        this.winView.visible = false;
        this.winView.animationSpeed = 1 / animations["win"].length * 5;
        this.winView.loop = true;

        this._balanceBlock = this.addChild(new Sprite({
            texture: Assets.get(AssetsDB.texture.chicken_bage),
            anchor: .5,
            position: { x: -50, y: 100 },
            scale: 0
        }));

        this._balanceTxt = this._balanceBlock.addChild(new Text({
            style: {
                fontSize: APP_CONFIG.REM,
                fill: '#fff',
                fontWeight: "bold",
                stroke: {
                    color: '#000',
                    width: 2
                }
            },
            anchor: .5,
            y: 5
        }));
    }

    public playWin() {
        this.idleView.visible = false;
        this.jumpView.visible = false;
        this.winView.visible = true;

        this.idleView.stop();
        this.jumpView.stop();
        this.winView.play();
    }
}
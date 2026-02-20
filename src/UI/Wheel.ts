import * as PIXI from "pixi.js";
import {Assets, Graphics, Sprite, Text} from "pixi.js";
import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import {Game} from "../../plugins/Game/Game.ts";
import {WidgetRoot} from "../../plugins/Game/UI.ts";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import {ScreenContainer} from "../../plugins/Utils/Components/ScreenContainer.ts";
import {Cover} from "../../plugins/Utils/Components/Cover.ts";
import {OffClick, OnClick} from "../../plugins/Utils/UIEvents.ts";
import {APP_CONFIG} from "../config.ts";
import {sound} from "@pixi/sound";
import {CreateHandTutorial} from "./HandTutorial.ts";

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);

export type WheelScreen = {
    screen: ScreenContainer;
    cover: Cover;
    wheelSprite: Sprite;
    spinButton: Graphics | Sprite;
    spinButtonText: Text | null;
    winText: Text;
    isSpinning: boolean;
    isDisabled: boolean;
    onComplete?: () => void;
    game: Game;
}

class Wheel {
    private static _wheel: WheelScreen | null = null;
    private static _spinAnimation: gsap.core.Tween | null = null;

    public static async Show(game: Game, onComplete?: () => void): Promise<void> {
        if (this._wheel) {
            return;
        }

        this._wheel = await this.Construct(game, onComplete);

        await Promise.all([
            this._wheel.cover.show(),
            this._wheel.screen.show()
        ]);

        const handTutorialSpin = CreateHandTutorial(game, this._wheel.spinButton, {
            scale: 1.5,
            offsetY: 75,
            offsetYPortrait: 100,
        });
        handTutorialSpin.show();

        this.activateSpinButton(handTutorialSpin);
    }

    private static async Hide(): Promise<void> {
        if (!this._wheel) return;

        if (this._spinAnimation) {
            this._spinAnimation.kill();
            this._spinAnimation = null;
        }

        this._handTutorialSpin?.destroy();
        this._handTutorialSpin = null;

        if (this._wheel.onComplete)
            this._wheel.onComplete();

        await Promise.all([
            this._wheel.screen.hide(),
            this._wheel.cover.hide(),
        ]);

        this._wheel.game.ui.remove(this._wheel.screen);
        this._wheel.game.ui.remove(this._wheel.cover);
        this._wheel = null;
    }

    private static async Construct(game: Game, onComplete?: () => void): Promise<WheelScreen> {
        const cover = game.ui.add(new Cover(game.resizer, 0.6, 0.3), WidgetRoot.CENTER);

        const screen = game.ui.add(new ScreenContainer(0.5, 1), WidgetRoot.CENTER);

        const wheelTexture = Assets.get(AssetsDB.texture.rool);
        const arrowTexture = Assets.get(AssetsDB.texture.arroe);

        const wheelSprite = screen.addChild(new Sprite({
            texture: wheelTexture,
            anchor: {x: 0.5, y: 0.5}
        }));
        wheelSprite.rotation = 0;

        const wheelSize = APP_CONFIG.designSize.x * 0.9;

        wheelSprite.scale.set(wheelSize / Math.max(wheelTexture.width, wheelTexture.height));

        const spinButtonTexture = Assets.get(AssetsDB.texture.spine);

        let spinButton: Graphics | Sprite;
        let spinButtonText: Text | null = null;

        if (spinButtonTexture) {
            spinButton = screen.addChild(new Sprite({
                texture: spinButtonTexture,
                anchor: {x: 0.5, y: 0.5}
            }));
            const buttonSize = wheelSize * 0.5;
            spinButton.scale.set(buttonSize / Math.max(spinButtonTexture.width, spinButtonTexture.height));
        } else {
            const buttonRadius = wheelSize * 0.15;
            spinButton = screen.addChild(new Graphics()
                .circle(0, 0, buttonRadius)
                .fill('#FFD700')
                .stroke({width: 4, color: '#FFA500'})
            );

            spinButtonText = spinButton.addChild(new Text({
                text: "SPIN",
                style: {
                    fontFamily: APP_CONFIG.fontFamily,
                    fontSize: buttonRadius * 0.6,
                    fontWeight: 'bold',
                    fill: '#000',
                    align: 'center'
                },
                anchor: {x: 0.5, y: 0.5}
            }));
        }
        spinButton.eventMode = 'static';
        spinButton.cursor = 'pointer';

        const arrowSprite = screen.addChild(new Sprite({
            texture: arrowTexture,
            anchor: {x: 0.5, y: 0.5}
        }));
        arrowSprite.position.y = -wheelSize / 2 + 30;
        arrowSprite.scale.set(wheelSize * 0.14 / Math.max(arrowTexture.width, arrowTexture.height));

        const winText = screen.addChild(new Text({
            text: "300х",
            style: {
                fontFamily: APP_CONFIG.fontFamily,
                fontSize: wheelSize * 0.3,
                fontWeight: 'bold',
                fill: '#FFC700',
                stroke: {width: wheelSize * 0.015, color: '#FF8C00'},
                align: 'center'
            },
            anchor: {x: 0.5, y: 0.5}
        }));
        winText.position.set(0, 0);
        winText.alpha = 0;
        winText.visible = false;

        return {
            screen,
            cover,
            wheelSprite,
            spinButton,
            spinButtonText,
            winText,
            isSpinning: false,
            isDisabled: false,
            onComplete,
            game
        };
    }

    private static _handTutorialSpin: ReturnType<typeof CreateHandTutorial> | null = null;

    private static _onSpinWithHand = (): void => {
        this._handTutorialSpin?.hide();
        this.onSpinClick();
    };

    private static activateSpinButton(handTutorial?: ReturnType<typeof CreateHandTutorial>): void {
        if (!this._wheel) return;

        this._handTutorialSpin = handTutorial ?? this._handTutorialSpin;
        OffClick(this._wheel.spinButton, this._onSpinWithHand);
        OnClick(this._wheel.spinButton, this._onSpinWithHand);
    }

    private static onSpinClick = (): void => {
        if (!this._wheel || this._wheel.isSpinning || this._wheel.isDisabled) return;

        this.spinWheel();
    };

    private static spinWheel(): void {
        if (!this._wheel || this._wheel.isSpinning) return;

        sound.play(AssetsDB.audio.wheel);

        this._wheel.isSpinning = true;

        this._wheel.spinButton.eventMode = 'none';
        this._wheel.spinButton.cursor = 'default';
        this._wheel.spinButton.alpha = 0.7;

        const SECTORS_COUNT = 6;
        const TARGET_SECTOR = 6;
        const DEGREES_PER_SECTOR = 360 / SECTORS_COUNT;
        const HALF_SECTOR = DEGREES_PER_SECTOR / 2;
        const TEXTURE_OFFSET_DEG = 0;

        const fullRotations = 5 + Math.random() * 3;
        const sector6CenterDeg = (TARGET_SECTOR - 1) * DEGREES_PER_SECTOR + HALF_SECTOR + TEXTURE_OFFSET_DEG;
        const finalRotation = fullRotations * Math.PI * 2 + (sector6CenterDeg * Math.PI / 180);

        const spinDuration = 3 + Math.random();

        this._spinAnimation = gsap.to(this._wheel.wheelSprite, {
            rotation: finalRotation,
            duration: spinDuration,
            ease: "power2.out",
            onComplete: () => {
                sound.stop(AssetsDB.audio.wheel);

                this.onSpinComplete();
            }
        });
    }

    private static onSpinComplete(): void {
        if (!this._wheel) return;

        this._wheel.isSpinning = false;
        this._wheel.isDisabled = true;

        OffClick(this._wheel.spinButton, this._onSpinWithHand);

        this._wheel.spinButton.alpha = 0.5;
        if (this._wheel.spinButtonText) {
            this._wheel.spinButtonText.text = "DONE";
        }

        // Показываем текст "300х" с анимацией
        this._wheel.winText.visible = true;
        this._wheel.winText.scale.set(0.8);
        gsap.to(this._wheel.winText.scale, {
            x: 1.2,
            y: 1.2,
            duration: 0.5,
            ease: "back.out"
        });
        gsap.to(this._wheel.winText, {
            alpha: 1,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
                // После показа текста, через некоторое время скрываем все
                setTimeout(() => {
                    if (this._wheel?.onComplete) {
                        this._wheel.onComplete();
                    }
                    this.Hide();
                }, 1500);
            }
        });
    }
}

export default Wheel

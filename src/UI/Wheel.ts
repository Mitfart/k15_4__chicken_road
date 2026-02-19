/**
 * Компонент колеса фортуны с анимацией вращения
 * 
 * Требуемые ассеты в AssetsDB.texture:
 * - wheel - текстура колеса фортуны
 * 
 * Использование:
 * import Wheel from "../UI/Wheel.ts";
 * Wheel.Show(game, () => { console.log("Колесо остановилось!"); });
 */

import * as PIXI from "pixi.js";
import {Sprite, Graphics, Text, Container} from "pixi.js";
import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import {Game} from "../../plugins/Game/Game.ts";
import {WidgetRoot} from "../../plugins/Game/UI.ts";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import {Assets} from "pixi.js";
import {ScreenContainer} from "../../plugins/Utils/Components/ScreenContainer.ts";
import {Cover} from "../../plugins/Utils/Components/Cover.ts";
import {OnClick, OffClick} from "../../plugins/Utils/UIEvents.ts";
import {APP_CONFIG} from "../../src/config.ts";

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);

export type WheelScreen = {
    screen: ScreenContainer;
    cover: Cover;
    wheelSprite: Sprite;
    spinButton: Graphics | Sprite;
    spinButtonText: Text | null;
    isSpinning: boolean;
    isDisabled: boolean;
    onComplete?: () => void;
    game: Game;
}

export default class Wheel {
    private static _wheel: WheelScreen | null = null;
    private static _spinAnimation: gsap.core.Tween | null = null;

    public static async Show(game: Game, onComplete?: () => void): Promise<void> {
        if (this._wheel) {
            return;
        }

        this._wheel = await this.Construct(game, onComplete);

        await this._wheel.cover.show();

        await this._wheel.screen.show();

        this.activateSpinButton();
    }

    /**
     * Скрывает колесо
     */
    private static async Hide(): Promise<void> {
        if (!this._wheel) return;

        const onComplete = this._wheel.onComplete;

        if (this._spinAnimation) {
            this._spinAnimation.kill();
            this._spinAnimation = null;
        }

        await this._wheel.screen.hide();

        await this._wheel.cover.hide();

        this._wheel.game.ui.remove(this._wheel.screen);
        this._wheel.game.ui.remove(this._wheel.cover);
        this._wheel = null;

        if (onComplete) {
            onComplete();
        }
    }

    private static async Construct(game: Game, onComplete?: () => void): Promise<WheelScreen> {
        const cover = game.ui.add(new Cover(game.resizer, 0.6, 0.3), WidgetRoot.CENTER);

        const screen = game.ui.add(new ScreenContainer(0.5, 1), WidgetRoot.CENTER);

        let wheelTexture;
        try {
            if (!AssetsDB.texture.wheel) {
                throw new Error("Wheel texture not found in AssetsDB.texture");
            }
            if (!Assets.cache.has(AssetsDB.texture.wheel)) {
                console.error("Wheel: Texture not loaded. Make sure wheel texture is loaded before showing wheel.");
                throw new Error("Wheel texture not in cache");
            }
            wheelTexture = Assets.get(AssetsDB.texture.wheel);
        } catch (error: any) {
            console.error("Wheel: Error loading wheel texture:", error.message);
            throw new Error(`Failed to load wheel texture: ${error.message}`);
        }

        // Создаем спрайт колеса
        const wheelSprite = screen.addChild(new Sprite({
            texture: wheelTexture,
            anchor: { x: 0.5, y: 0.5 }
        }));

        // Размер колеса (можно настроить)
        const wheelSize = Math.min(game.resizer.width * 0.6, game.resizer.height * 0.6);
        wheelSprite.scale.set(wheelSize / Math.max(wheelTexture.width, wheelTexture.height));

        // Создаем кнопку SPIN в центре колеса используя текстуру spine
        let spinButtonTexture;
        try {
            if (AssetsDB.texture.spine && Assets.cache.has(AssetsDB.texture.spine)) {
                spinButtonTexture = Assets.get(AssetsDB.texture.spine);
            }
        } catch (error) {
            console.warn("Wheel: Spine texture not found, using graphics button instead");
        }

        let spinButton: Graphics | Sprite;
        let spinButtonText: Text | null = null;

        if (spinButtonTexture) {
            spinButton = screen.addChild(new Sprite({
                texture: spinButtonTexture,
                anchor: { x: 0.5, y: 0.5 }
            }));
            const buttonSize = wheelSize * 0.2;
            spinButton.scale.set(buttonSize / Math.max(spinButtonTexture.width, spinButtonTexture.height));
        } else {
            const buttonRadius = wheelSize * 0.15;
            spinButton = screen.addChild(new Graphics()
                .circle(0, 0, buttonRadius)
                .fill('#FFD700')
                .stroke({ width: 4, color: '#FFA500' })
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
                anchor: { x: 0.5, y: 0.5 }
            }));
        }
        spinButton.eventMode = 'static';
        spinButton.cursor = 'pointer';

        return {
            screen,
            cover,
            wheelSprite,
            spinButton,
            spinButtonText,
            isSpinning: false,
            isDisabled: false,
            onComplete,
            game
        };
    }

    private static activateSpinButton(): void {
        if (!this._wheel) return;

        OffClick(this._wheel.spinButton, this.onSpinClick);

        OnClick(this._wheel.spinButton, this.onSpinClick);
    }
    private static onSpinClick = (): void => {
        if (!this._wheel || this._wheel.isSpinning || this._wheel.isDisabled) return;

        this.spinWheel();
    };
    private static spinWheel(): void {
        if (!this._wheel || this._wheel.isSpinning) return;

        this._wheel.isSpinning = true;

        this._wheel.spinButton.eventMode = 'none';
        this._wheel.spinButton.cursor = 'default';
        this._wheel.spinButton.alpha = 0.7;

        const fullRotations = 5 + Math.random() * 3; 
        const targetAngleDegrees = 20;
        const targetAngleRadians = (targetAngleDegrees * Math.PI) / 180;
        
        const currentRotation = this._wheel.wheelSprite.rotation;
        
        const finalRotation = currentRotation + (fullRotations * Math.PI * 2) + targetAngleRadians;
        
        const spinDuration = 3 + Math.random() * 1; 

        this._spinAnimation = gsap.to(this._wheel.wheelSprite, {
            rotation: finalRotation,
            duration: spinDuration,
            ease: "power2.out", 
            onComplete: () => {
                this.onSpinComplete();
            }
        });
    }

    private static onSpinComplete(): void {
        if (!this._wheel) return;

        this._wheel.isSpinning = false;
        this._wheel.isDisabled = true; 

        OffClick(this._wheel.spinButton, this.onSpinClick);

        this._wheel.spinButton.alpha = 0.5;
        if (this._wheel.spinButtonText) {
            this._wheel.spinButtonText.text = "DONE";
        }

        if (this._wheel.onComplete) {
            this._wheel.onComplete();
        }

        setTimeout(() => {
            this.Hide();
        }, 2000); 
    }
}

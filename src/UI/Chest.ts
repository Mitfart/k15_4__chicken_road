/**
 * Компонент сундука с покадровой анимацией открывания
 * 
 * Требуемые ассеты в AssetsDB.data.chest:
 * - animations["closed"] - анимация закрытого сундука (зацикленная)
 * - animations["open"] - анимация открытия сундука (один раз)
 * - animations["opened"] - (опционально) анимация открытого сундука (зацикленная)
 * 
 * Использование:
 * import Chest from "../UI/Chest.ts";
 * Chest.Show(game, () => { console.log("Сундук закрыт!"); });
 */

import * as PIXI from "pixi.js";
import {AnimatedSprite, Assets} from "pixi.js";
import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import {Game} from "../../plugins/Game/Game.ts";
import {WidgetRoot} from "../../plugins/Game/UI.ts";
import {LoadAssetsDB} from "../../plugins/Assets/LoadAssetsDB.ts";
import {ScreenContainer} from "../../plugins/Utils/Components/ScreenContainer.ts";
import {Cover} from "../../plugins/Utils/Components/Cover.ts";
import {OnClick} from "../../plugins/Utils/UIEvents.ts";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import Panel from "./Panel.ts";

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);

export type ChestScreen = {
    screen: ScreenContainer;
    cover: Cover;
    chestSprite: AnimatedSprite;
    openedSprite?: AnimatedSprite;
    isOpened: boolean;
    onComplete?: () => void;
    game: Game;
}

export default class Chest {
    private static _chest: ChestScreen | null = null;

    public static async Show(game: Game, onComplete?: () => void): Promise<void> {
        if (this._chest) {
            return;
        }

        this._chest = await this.Construct(game, onComplete);

        await Promise.all([
            this._chest.cover.show(),
            this._chest.screen.show()
        ]);

        this.waitForOpenClick();
    }
    public static async Hide(): Promise<void> {
        if (!this._chest) return;

        const onComplete = this._chest.onComplete;

        await this._chest.screen.hide();

        await this._chest.cover.hide();

        this._chest.game.ui.remove(this._chest.screen);
        this._chest.game.ui.remove(this._chest.cover);
        this._chest = null;

        if (onComplete) {
            onComplete();
        }
    }
    private static async Construct(game: Game, onComplete?: () => void): Promise<ChestScreen> {
        // Создаем затемнение фона (добавляем первым, чтобы был за сундуком)
        const cover = game.ui.add(new Cover(game.resizer, 0.6, 0.3), WidgetRoot.CENTER);

        const screen = game.ui.add(new ScreenContainer(0.5, 2.5), WidgetRoot.CENTER);

        const chestData = Assets.get(AssetsDB.data.chest);
        const animations = chestData.animations;

        const closedFrames = animations["closed"];
        const chestSprite = screen.addChild(AnimatedSprite.fromFrames(closedFrames));
        chestSprite.anchor.set(0.5);
        chestSprite.animationSpeed = 1 / closedFrames.length * 10; 
        chestSprite.loop = true;
        chestSprite.play();

        let openedSprite: AnimatedSprite | undefined;
        const openedFrames = animations["opened"];
        if (openedFrames && Array.isArray(openedFrames) && openedFrames.length > 0) {
            openedSprite = screen.addChild(AnimatedSprite.fromFrames(openedFrames));
            openedSprite.anchor.set(0.5);
            openedSprite.animationSpeed = 1 / openedFrames.length * 10; 
            openedSprite.loop = true; 
            openedSprite.visible = false; 
        }

        return {
            screen,
            cover,
            chestSprite,
            openedSprite,
            isOpened: false,
            onComplete,
            game
        };
    }
    private static waitForOpenClick(): void {
        if (!this._chest) return;

        OnClick(this._chest.screen, () => {
            if (!this._chest) return;

            if (!this._chest.isOpened) {
                this.openChest();
            } else {
                Panel.Hide().then(() => Chest.Hide());
            }
        });
    }

    private static async openChest(): Promise<void> {
        if (!this._chest || this._chest.isOpened) return;

        this._chest.isOpened = true;

        let chestData: any;
        try {
            const assetsDB = await LoadAssetsDB();
            
            if (!assetsDB || !assetsDB.data || !assetsDB.data.chest) {
                return;
            }
            
            chestData = assetsDB.data.chest;
            
            if (!chestData || typeof chestData !== 'object') {
                return;
            }
        } catch (error: any) {
            return;
        }
        
        let animations = chestData.animations;
        
        if (!animations && chestData.frames && typeof chestData.frames === 'object') {
            const frameKeys = Object.keys(chestData.frames);
            
            if (frameKeys.length >= 10) {
                const closedFrames = frameKeys.slice(0, 10);
                const openFrames = frameKeys.slice(10);
                const openedFrames = frameKeys.slice(-1);
                
                animations = {
                    closed: closedFrames,
                    open: openFrames,
                    opened: openedFrames
                };
            }
        }
        
        if (!animations) {
            return;
        }
        const openFrames = animations["open"];

        if (!openFrames || !Array.isArray(openFrames) || openFrames.length === 0) {
            return;
        }

        this._chest.chestSprite.stop();
        this._chest.chestSprite.visible = false;
        const openSprite = this._chest.screen.addChild(AnimatedSprite.fromFrames(openFrames));
        openSprite.anchor.set(0.5);
        openSprite.loop = false; 
        openSprite.animationSpeed = 1 / openFrames.length * 15; 
        openSprite.play();

        openSprite.onComplete = () => {
            openSprite.destroy();

            if (!this._chest) return;
            
            if (this._chest.openedSprite) {
                this._chest.openedSprite.visible = true;
                this._chest.openedSprite.play();
            } else {
                this._chest.chestSprite.visible = true;
                this._chest.chestSprite.play();
            }

            Panel.Show(this._chest.game, {
                text: "CONGRATULATIONS",
                amountText: "1000 EUR",
                buttonText: "CLAIM",
                onClaim: async () => {
                    await Panel.Hide();
                    await Chest.Hide();
                }
            });
        };
    }
}

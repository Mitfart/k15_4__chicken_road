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
    private static _chest: ChestScreen;

    public static async Show(game: Game, onComplete?: () => void): Promise<void> {
        this._chest ??= await this.Construct(game, onComplete);

        await Promise.all([
            this._chest.cover.show(),
            this._chest.screen.show()
        ]);

        this.waitForOpenClick();
    }

    public static async Hide(): Promise<void> {
        if (!this._chest) return;

        await Promise.all([
            this._chest.cover.hide(),
            this._chest.screen.hide()
        ]);

        this._chest.game.ui.remove(this._chest.screen);
        this._chest.game.ui.remove(this._chest.cover);
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
        chestSprite.loop = false;

        const openedFrames = animations["opened"];
        const openedSprite = screen.addChild(AnimatedSprite.fromFrames(openedFrames));
        openedSprite.anchor.set(0.5);
        openedSprite.animationSpeed = 1 / openedFrames.length * 10;
        openedSprite.loop = false;
        openedSprite.visible = false;

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
        OnClick(this._chest.screen, async () => {
            if (!this._chest.isOpened)
                this.openChest();
        });
    }

    private static async openChest(): Promise<void> {
        if (this._chest.isOpened) return;

        this._chest.isOpened = true;
        this._chest.chestSprite.stop();
        this._chest.chestSprite.visible = false;

        const openFrames = Assets.get(AssetsDB.data.chest).animations["open"];
        const openSprite = this._chest.screen.addChild(AnimatedSprite.fromFrames(openFrames));
        openSprite.anchor.set(0.5);
        openSprite.loop = false;
        openSprite.animationSpeed = 1 / openFrames.length * 10;
        openSprite.play();

        openSprite.onComplete = () => {
            openSprite.destroy();

            Panel.Show(this._chest.game, {
                text: "CONGRATULATIONS",
                amountText: "1000 EUR",
                buttonText: "CLAIM",
                onClaim: async () => {
                    await Promise.all([
                        Panel.Hide(),
                        Chest.Hide(),
                    ]);

                    if (this._chest.onComplete)
                        this._chest.onComplete();
                }
            });
        };
    }
}

/**
 * Универсальная панель с белым текстом и жёлтой кнопкой.
 * Можно вызывать в любой момент и передать нужный текст.
 *
 * Использование:
 * Panel.Show(game, { text: "CONGRATULATIONS", amountText: "1000 EUR", buttonText: "CLAIM", onClaim: () => { ... } });
 */

import {Container, Graphics, Sprite, Text} from "pixi.js";
import {Assets} from "pixi.js";
import {Game} from "../../plugins/Game/Game.ts";
import {WidgetRoot} from "../../plugins/Game/UI.ts";
import {ScreenContainer} from "../../plugins/Utils/Components/ScreenContainer.ts";
import {OnClick} from "../../plugins/Utils/UIEvents.ts";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import {APP_CONFIG} from "../config.ts";
import {CreateHandTutorial} from "./HandTutorial.ts";

export type PanelOptions = {
    text: string;
    amountText?: string;
    buttonText?: string;
    onClaim: () => void;
}

export type PanelScreen = {
    screen: ScreenContainer;
    onClaim: () => void;
    game: Game;
    handTutorial: ReturnType<typeof CreateHandTutorial>;
}

export default class Panel {
    private static _panel: PanelScreen | null = null;

    public static async Show(game: Game, options: PanelOptions): Promise<void> {
        if (this._panel) {
            await this.Hide();
        }

        this._panel = await this.Construct(game, options);

        await this._panel.screen.show();
        this._panel.handTutorial.show();
    }

    public static async Hide(): Promise<void> {
        if (!this._panel) return;

        this._panel.handTutorial.destroy();
        await this._panel.screen.hide();

        this._panel.game.ui.remove(this._panel.screen);
        this._panel = null;
    }

    private static async Construct(game: Game, options: PanelOptions): Promise<PanelScreen> {
        const screen = game.ui.add(new ScreenContainer(0.35, 1.3), WidgetRoot.CENTER);

        const panelWidth = APP_CONFIG.designSize.x * 0.85 * 2 * 1.5;
        const panelHeight = APP_CONFIG.designSize.y * 0.35 * 2 * 1.5;
        const buttonWidth = 180;
        const buttonHeight = 56;
        const buttonRadius = 28;

        let hasPanelTexture = false;
        try {
            Assets.get(AssetsDB.texture.bonus_panel);
            hasPanelTexture = true;
        } catch {
            /* texture not loaded, use Graphics */
        }

        if (hasPanelTexture) {
            const panelTexture = Assets.get(AssetsDB.texture.bonus_panel);
            const bgSprite = screen.addChild(new Sprite({texture: panelTexture, anchor: 0.5}));
            bgSprite.scale.set(3);
        } else {
            screen.addChild(new Graphics()
                .roundRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 48)
                .fill({color: 0x2a2a2a, alpha: 0.95})
                .stroke({width: 6, color: 0x555555})
            );
        }

        const titleText = screen.addChild(new Text({
            text: options.text,
            style: {
                fontFamily: APP_CONFIG.fontFamily,
                fontSize: 38,
                fontWeight: "bold",
                fill: "#ffffff",
                align: "center",
                stroke: {color: "#000000", width: 2},
            },
            anchor: {x: 0.5, y: 0.5},
        }));
        titleText.position.set(0, -125);

        const amountText = screen.addChild(new Text({
            text: options.amountText ?? "1000 EUR",
            style: {
                fontFamily: APP_CONFIG.fontFamily,
                fontSize: 56,
                fontWeight: "bold",
                fill: "#ffffff",
                align: "center",
                stroke: {color: "#000000", width: 3},
            },
            anchor: {x: 0.5, y: 0.5},
        }));
        amountText.position.set(0, 55);

        const btnText = options.buttonText ?? "CLAIM";
        const button = screen.addChild(new Container());
        button.addChild(new Graphics()
            .roundRect(0, 0, buttonWidth, buttonHeight, buttonRadius)
            .fill("#FFD700")
            .stroke({width: 3, color: "#FFA500"})
        );
        const buttonLabel = button.addChild(new Text({
            text: btnText,
            style: {
                fontFamily: APP_CONFIG.fontFamily,
                fontSize: 28,
                fontWeight: "bold",
                fill: "#0a0a0a",
                align: "center",
            },
            anchor: 0.5,
        }));
        buttonLabel.position.set(buttonWidth / 2, buttonHeight / 2);
        button.position.set(-buttonWidth / 2, 100);
        button.eventMode = "static";
        button.cursor = "pointer";

        const onClaim = () => {
            if (options.onClaim) options.onClaim();
        };

        OnClick(button, () => {
            onClaim();
        });

        const handTutorial = CreateHandTutorial(game, button, {
            scale: 1.5,
            offsetY: 75,
            offsetYPortrait: 100,
        });

        return {
            screen,
            onClaim,
            game,
            handTutorial,
        };
    }
}

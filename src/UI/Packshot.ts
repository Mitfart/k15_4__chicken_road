import * as PIXI from "pixi.js";
import {AnimatedSprite, Assets, Container, Graphics, Sprite, Text} from "pixi.js";

import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import {Game} from "../../plugins/Game/Game.ts";
import {APP_CONFIG} from "../config.ts";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import {DropShadowFilter} from "pixi-filters";
import {Play} from "../../plugins/Utils/Animations.ts";
import {AnimScaleLoop} from "./Anims.ts";
import {ScreenContainer} from "../../plugins/Utils/Components/ScreenContainer.ts";

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);


export type PackshotScreen = {
    container: ScreenContainer,
    btn: Container
}

export default class Packshot {
    private static _packshot: PackshotScreen;


    public static async Construct(game: Game): Promise<PackshotScreen> {
        if (this._packshot)
            return this._packshot;

        const width = APP_CONFIG.designSize.x - APP_CONFIG.padding.x * 2;

        const container = game.ui.add(new ScreenContainer());

        const background = container.addChild(new Graphics());

        const backgroundTex = Assets.get(AssetsDB.texture.packshot_background);
        const backgroundImage = container.addChild(new Sprite({
            texture: backgroundTex,
            anchor: .5,
        }));

        const packshotChicken = container.addChild(new Sprite({
            texture: Assets.get(AssetsDB.texture.packshot_chicken),
            anchor: .5,
            y: -250,
        }));

        const packshot_block = container.addChild(AnimatedSprite.fromFrames(Assets.get(AssetsDB.data.packshot_block).animations[AssetsDB.data.packshot_block]));
        packshot_block.animationSpeed = .5;
        packshot_block.anchor = .5;
        packshot_block.scale = 3.25;
        packshot_block.y = 150;
        packshot_block.play();

        container.addChild(new Text({
            text: "BONUS",
            style: {
                fill: '#fff',
                fontSize: APP_CONFIG.REM * 2.5,
                fontWeight: '900',
                stroke: {
                    width: 4,
                    color: '#000',
                }
            },
            anchor: .5,
            y: -25
        }));

        container.addChild(new Text({
            text: "€1500",
            style: {
                fontFamily: APP_CONFIG.fontFamily,
                fill: "#f8d715",
                fontSize: APP_CONFIG.REM * 3.75,
                stroke: {
                    color: "#ffeec8",
                    width: 6,
                    join: "round"
                },
                fontWeight: "bold",
                align: "center",
            },
            anchor: { x: .5, y: .65 },
            y: 150
        })).filters = [
            new DropShadowFilter({
                color: "#c82e00",
                offset: { x: 0, y: 5 },
                blur: 0,
                alpha: 1
            })
        ];

        container.addChild(new Text({
            text: "+250 FREE SPINS",
            style: {
                fontFamily: APP_CONFIG.fontFamily,
                fill: "#f8d715",
                fontSize: APP_CONFIG.REM * 1.75,
                stroke: {
                    color: "#ffeec8",
                    width: 4,
                    join: "round"
                },
                fontWeight: "bold",
                align: "center",
            },
            anchor: { x: .5, y: .65 },
            y: 250
        })).filters = [
            new DropShadowFilter({
                color: "#c82e00",
                offset: { x: 0, y: 5 },
                blur: 0,
                alpha: 1
            })
        ];

        const btn = container.addChild(new Sprite({
            texture: Assets.get(AssetsDB.texture.packshot_btn),
            anchor: .5,
            scale: 1.5,
            y: 425
        }));
        btn.addChild(new Text({
            text: "DOWNLOAD",
            style: {
                fill: '#012c00',
                fontSize: APP_CONFIG.REM,
                fontWeight: '900',
            },
            anchor: .5,
        }));

        const googleTex = Assets.get(AssetsDB.texture.packshot_google);
        const googleBtn = container.addChild(new Sprite({
            texture: googleTex,
            anchor: { x: 1, y: 1 },
            x: width / 2,
            scale: .65,
        }));

        const appStoreTex = Assets.get(AssetsDB.texture.packshot_app);
        const appStoreBtn = container.addChild(new Sprite({
            texture: appStoreTex,
            anchor: { x: 0, y: 1 },
            x: -width / 2,
            scale: .65,
        }));

        game.resizer.addResizeAction((w, h) => {
            background
                .rect(-w / 2, -h / 2, w, h)
                .fill('#48244b');

            backgroundImage.scale = h / backgroundTex.height;

            googleBtn.y = h / 2 - APP_CONFIG.padding.y;
            appStoreBtn.y = h / 2 - APP_CONFIG.padding.y;
        });

        Play(AnimScaleLoop(packshotChicken))();
        Play(AnimScaleLoop(btn, { from: 1.5, to: 1.6 }))();

        return this._packshot = {
            container,
            btn
        };
    }
}
import * as PIXI from "pixi.js";
import {Assets, Container, Graphics, Sprite} from "pixi.js";

import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import {Game} from "../../plugins/Game/Game.ts";
import {WidgetRoot} from "../../plugins/Game/UI.ts";
import {AnimatedText} from "../../plugins/Utils/Components/AnimatedText.ts";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import {APP_CONFIG} from "../config.ts";
import {AssetsBase64} from "../../plugins/Assets/AssetsBase64.ts";

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);


export type HeaderScreen = {
    container: Container,
    balanceBlock: Container;
    balanceTxt: AnimatedText
}

export default class Header {
    private static _header: HeaderScreen;


    public static async Construct(game: Game): Promise<HeaderScreen> {
        if (this._header)
            return this._header;

        await Promise.all([
            AssetsBase64.load(AssetsDB.font.Cera, 'font'),
            AssetsBase64.load(AssetsDB.texture.logo, 'texture'),
        ]);

        const width = APP_CONFIG.designSize.x - APP_CONFIG.padding.x * 2;
        const height = 100;
        const stroke = height / 8;

        const container = game.ui.add(
            new Container(),
            WidgetRoot.TOP,
            { x: 0, y: -stroke });

        const background = container.addChild(new Graphics());
        game.resizer.addResizeAction((w) => {
            background
                .clear()
                .rect(-w / 2, -height / 2, w, height)
                .stroke({
                    width: stroke,
                    color: '#333333',
                    alignment: 0
                })
                .fill('#434343');
        });

        const logo = container.addChild(new Sprite({
            texture: Assets.get(AssetsDB.texture.logo),
            anchor: {x: 0, y: 0.5},
            scale: 1.25
        }));

        const balanceBlockSize = {
            x: height * 3.5,
            y: height * .75
        }

        const balanceBlock = container.addChild(new Graphics()
            .roundRect(-balanceBlockSize.x / 2, -balanceBlockSize.y / 2, balanceBlockSize.x, balanceBlockSize.y, balanceBlockSize.y / 4)
            .fill('#585858')
        );

        const balanceTxt = balanceBlock.addChild(new AnimatedText({
            style: {
                fill: '#fdfdfc',
                fontFamily: APP_CONFIG.fontFamily,
                fontSize: APP_CONFIG.REM * 1.5,
                fontWeight: 'bold'
            },
            anchor: .5
        }, 0, .5, '', ' EUR', 1));

        logo.x = -width / 2;
        balanceBlock.x = width / 2 - balanceBlock.width / 2;

        return this._header = {
            container,
            balanceBlock,
            balanceTxt
        };
    }
}
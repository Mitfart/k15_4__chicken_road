import * as PIXI from "pixi.js";
import {Assets, Container, FillInput, Graphics, Sprite, TextStyleFontWeight} from "pixi.js";

import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import {Game} from "../../plugins/Game/Game.ts";
import {WidgetRoot} from "../../plugins/Game/UI.ts";
import {AnimatedText} from "../../plugins/Utils/Components/AnimatedText.ts";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import {APP_CONFIG} from "../config.ts";

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);


export type HeaderScreen = {
    container: Container,
    balanceTxt: AnimatedText
}

export default class Header {
    private static _header: HeaderScreen;


    public static async Construct(game: Game): Promise<HeaderScreen> {
        if (this._header)
            return this._header;

        const height = 150;
        const header = game.ui.add(new Container(), WidgetRoot.TOP);

        const background = header.addChild(new Graphics());

        const logo = header.addChild(new Sprite({
            texture: Assets.get(AssetsDB.texture.logo),
            anchor: {x: 0, y: 0.5},
            scale: 1.25
        }));

        const balanceBlockSize = {
            x: height * 2,
            y: height * 0.5
        }

        const balanceBlock = header.addChild(new Graphics()
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

        game.resizer.addResizeAction((w) => {
            const stroke = height / 3;

            background
                .clear()
                .rect(-w / 2, -height / 2 - stroke, w, height)
                .stroke({
                    width:stroke,
                    color: '#333333',
                })
                .fill('#434343');

            logo.position.set(
                -w / 2 + 25,
                -stroke / 2
            );

            balanceBlock.position.set(
                w / 2 - balanceBlock.width / 2 - 25,
                -stroke / 2
            );
        });

        return this._header = {
            container: header,
            balanceTxt
        };
    }
}
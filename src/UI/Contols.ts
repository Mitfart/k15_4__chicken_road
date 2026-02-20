import * as PIXI from "pixi.js";
import {Assets, Container, Graphics, Sprite, Text, TextStyleOptions} from "pixi.js";

import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import {Game} from "../../plugins/Game/Game.ts";
import {WidgetRoot} from "../../plugins/Game/UI.ts";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import {APP_CONFIG} from "../config.ts";
import {AnimatedText} from "../../plugins/Utils/Components/AnimatedText.ts";

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);


export type ControlsScreen = {
    container: Container,
    topPanel: Sprite,
    playBtn: Container,
    cashBtn: Container,
    balanceTxt: AnimatedText
}

export default class Contols {
    private static _controls: ControlsScreen;


    public static async Construct(game: Game): Promise<ControlsScreen> {
        if (this._controls)
            return this._controls;


        const width = APP_CONFIG.designSize.x - APP_CONFIG.padding.x * 2;
        const btnHeight = 200;
        const btnWidth = (width - APP_CONFIG.padding.x) / 2;

        const controlsTopTex = Assets.get(AssetsDB.texture.controls_top);
        const topPanel = new Sprite({
            texture: controlsTopTex,
            anchor: { x: .5, y: 1 },
            scale: width / controlsTopTex.width
        });

        const totalHeight = btnHeight + topPanel.height + APP_CONFIG.padding.y * 3;

        const screen = game.ui.add(new Container(), WidgetRoot.BOTTOM);

        const background = screen.addChild(new Graphics());

        screen.addChild(topPanel);


        const playBtn = screen.addChild(new Graphics({ position: { x: width / 4, y: btnHeight / 2 + APP_CONFIG.padding.y } })
            .roundRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight)
            .fill('#3c8f57')
        );
        playBtn.addChild(new Text({
            text: "GO",
            style: {
                fontFamily: APP_CONFIG.fontFamily,
                fontSize: APP_CONFIG.REM * 2.5,
                fontWeight: 'bold',
                fill: '#fff'
            },
            anchor: .5
        }));


        const cashBtn = screen.addChild(new Graphics({ position: { x: -width / 4, y: btnHeight / 2 + APP_CONFIG.padding.y }})
            .roundRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight)
            .fill('#ffc600')
        );
        const cashTextStyle: TextStyleOptions = {
            fontFamily: APP_CONFIG.fontFamily,
            fontSize: APP_CONFIG.REM * 1.5,
            fontWeight: 'bold',
            fill: '#000'
        };
        cashBtn.addChild(new Text({
            text: "CASH OUT",
            style: cashTextStyle,
            anchor: .5,
            y: -APP_CONFIG.REM
        }));
        const balanceTxt = cashBtn.addChild(new AnimatedText({
            style: cashTextStyle,
            anchor: .5,
            y: APP_CONFIG.REM
        }, 0, .5, '', ' EUR', 2));


        game.resizer.addResizeAction((w) => {
            background
                .clear()
                .rect(-w / 2, -totalHeight / 2, w, totalHeight)
                .fill('#434343');
        });

        return this._controls = {
            container: screen,
            topPanel,
            playBtn,
            cashBtn,
            balanceTxt
        };
    }
}
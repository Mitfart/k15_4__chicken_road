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


        let contentWidth = APP_CONFIG.designSize.x - APP_CONFIG.padding.x * 2;
        const btnHeight = 200;
        const btnWidth = (contentWidth - APP_CONFIG.padding.x) / 2;

        const controlsTopTex = Assets.get(AssetsDB.texture.controls_top);
        const topPanel = new Sprite({
            texture: controlsTopTex,
            anchor: { x: .5, y: 1 },
            scale: contentWidth / controlsTopTex.width
        });

        let totalHeight = btnHeight + topPanel.height + APP_CONFIG.padding.y * 3;


        const container = new Container();
        const background = container.addChild(new Graphics());

        container.addChild(topPanel);


        const playBtn = container.addChild(new Graphics({ position: { x: contentWidth / 4, y: btnHeight / 2 + APP_CONFIG.padding.y } })
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


        const cashBtn = container.addChild(new Graphics({ position: { x: -contentWidth / 4, y: btnHeight / 2 + APP_CONFIG.padding.y }})
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


        const betsViewTex = Assets.get(AssetsDB.texture.controls_mid);
        const betsView = container.addChild(new Sprite({
            texture: betsViewTex,
            anchor: .5,
            scale: topPanel.height / betsViewTex.height
        }));


        game.ui.add(container, WidgetRoot.BOTTOM, { x: 0, y: 0 }, (_: Container, w: number, h: number) => {
            const isPortrait = w <= h;

            contentWidth = isPortrait
                ? APP_CONFIG.designSize.x - APP_CONFIG.padding.x * 2
                : w - APP_CONFIG.padding.x * 4;
            totalHeight = isPortrait
                ? btnHeight + topPanel.height + APP_CONFIG.padding.y * 3
                : Math.max(btnHeight, topPanel.height) + APP_CONFIG.padding.y * 2;

            background.clear();
            if (isPortrait) {
                background.rect(-w / 2, -totalHeight / 2, w, totalHeight);
            } else {
                const width = w - APP_CONFIG.padding.x * 2;
                background.roundRect(-width / 2, -totalHeight / 2, width, totalHeight, APP_CONFIG.padding.x);
            }
            background.fill('#434343');

            if (!isPortrait) {
                topPanel.position.set((-contentWidth + topPanel.width) / 2, topPanel.height / 2);

                playBtn.position.set((contentWidth - btnWidth) / 2, 0);
                cashBtn.position.set((contentWidth - btnWidth) / 2 - btnWidth - APP_CONFIG.padding.x, 0);

                betsView.scale = (contentWidth - topPanel.width - btnWidth * 2 - APP_CONFIG.padding.x * 3) / betsViewTex.width
                betsView.visible = true;
            } else {
                topPanel.position.set(0, 0);

                playBtn.position.set( contentWidth / 4, btnHeight / 2 + APP_CONFIG.padding.y);
                cashBtn.position.set(-contentWidth / 4, btnHeight / 2 + APP_CONFIG.padding.y);

                betsView.visible = false;
            }
        }, true);

        return this._controls = {
            container: container,
            topPanel,
            playBtn,
            cashBtn,
            balanceTxt
        };
    }
}
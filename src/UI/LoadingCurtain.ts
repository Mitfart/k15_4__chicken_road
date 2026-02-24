import * as PIXI from "pixi.js";
import {Assets, BlurFilter, Container, Graphics, Sprite, Text} from "pixi.js";

import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import {AssetsBase64} from "../../plugins/Assets/AssetsBase64.ts";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB";
import {Game} from "../../plugins/Game/Game.ts";
import {WidgetRoot} from "../../plugins/Game/UI.ts";
import {AddBackground, AddCover} from "../../plugins/Game/GameUIUtils.ts";
import {APP_CONFIG} from "../config.ts";
import {AnimAlphaLoop} from "./Anims.ts";
import {Cover} from "../../plugins/Utils/Components/Cover.ts";

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);


export type Curtain = {
    view: Container,
    fill: Graphics,
    background: Sprite,
    cover: Cover,
};

export default class LoadingCurtain {
    private static _curtain: Curtain;


    public static async Show(game: Game, duration: number = 2): Promise<void> {
        this._curtain ??= await this.Construct(game);

        const initWidth = this._curtain.fill.width;

        const timeline = gsap.timeline();
        timeline.set(this._curtain.fill, { width: 0 })
            .to(this._curtain.fill, {
                duration: .35 * duration,
                width: initWidth * 0.5,
            })
            .to(this._curtain.fill, {
                duration: .5 * duration,
                width: initWidth * 0.75,
            })
            .to(this._curtain.fill, {
                duration: .15 * duration,
                width: initWidth,
            });

        await timeline.play();
    }

    public static Hide(game: Game) {
        if (!this._curtain) return;

        game.ui.remove(this._curtain.view);
        game.ui.remove(this._curtain.background);
        game.ui.remove(this._curtain.cover);
    }


    public static async Construct(game: Game): Promise<Curtain> {
        if (this._curtain)
            return this._curtain;

        const background = await AddBackground(AssetsDB.texture.loading_background);
        background.filters = [ new BlurFilter({ strength: 5 }) ];
        const cover = AddCover(.75, Number.EPSILON);
        cover.show();

        game.resize();

        await Promise.all([
            AssetsBase64.load(AssetsDB.texture.loading_logo, "texture"),
            AssetsBase64.load(AssetsDB.texture.loading_border, "texture"),
        ]);

        const view = game.ui.add(new Container(), WidgetRoot.CENTER);

        const loadingTxt = view.addChild(new Text({
            text: 'Loading...',
            style: {
                fontFamily: APP_CONFIG.fontFamily,
                fontSize: APP_CONFIG.REM * 1.5,
                fontWeight: 'bold',
                fill: '#fff'
            },
            anchor: .5,
            y: 225
        }));
        AnimAlphaLoop(loadingTxt);

        view.addChild(new Sprite({
            texture: Assets.get(AssetsDB.texture.loading_logo),
            anchor: .5,
            position: { x: 0, y: -300 }
        }));

        const border = view.addChild(new Sprite({
            texture: Assets.get(AssetsDB.texture.loading_border),
            anchor: .5,
            y: 300
        }));
        const borderPadding = 17;
        const innerWidth = border.width - borderPadding * 2;
        const innerHeight = border.height - borderPadding * 2;

        const mask = view.addChild(new Graphics()
            .roundRect(-innerWidth / 2, -innerHeight / 2, innerWidth, innerHeight, innerHeight / 2)
            .fill("#fff")
        );
        mask.position.set(border.x, border.y);

        const fill = view.addChild(new Graphics()
            .rect(0, 0, innerWidth, innerHeight)
            .fill('#ffbc00')
        );
        fill.position.set(
            border.x - innerWidth / 2,
            border.y - innerHeight / 2
        );
        fill.mask = mask;

        return this._curtain = {
            view,
            fill,
            background,
            cover
        };
    }
}
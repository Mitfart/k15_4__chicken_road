import * as PIXI from "pixi.js";
import {Assets, Container, Sprite, Text} from "pixi.js";

import {gsap} from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import {Game} from "../../plugins/Game/Game.ts";
import {WidgetRoot} from "../../plugins/Game/UI.ts";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import {APP_CONFIG} from "../config.ts";

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);


export class OnlineUsers {
    private static usersScreen: Container;


    public static async Construct(game: Game): Promise<Container> {
        if (this.usersScreen)
            return this.usersScreen;

        const headerHeight = 100 + 100 / 8;

        const onlineUsers = [
            AssetsDB.texture.player_01,
            AssetsDB.texture.player_02,
            AssetsDB.texture.player_03,
            AssetsDB.texture.player_04,
        ];

        const container = game.ui.add(new Sprite({
            texture: Assets.get(AssetsDB.texture.players_panel),
            anchor: .5
        }), WidgetRoot.TOP_LEFT, {x: 0, y: headerHeight});

        container.addChild(new Text({
            text: "Live wins",
            style: {
                fontFamily: APP_CONFIG.fontFamily,
                fontSize: APP_CONFIG.REM,
                fill: '#fff',
                fontWeight: 'bold',
            },
            anchor: {x: 0, y: .5},
            x: -container.width / 2 + 25,
            y: -container.height / 4,
        }));

        container.addChild(new Text({
            text: "Online: 11489",
            style: {
                fontFamily: APP_CONFIG.fontFamily,
                fontSize: APP_CONFIG.REM,
                fill: '#fff',
                fontWeight: 'bold',
            },
            anchor: {x: 0, y: .5},
            x: 25,
            y: -container.height / 4,
        }));


        onlineUsers.forEach(async (onlineUser, i) => {
            const view = container.addChild(new Sprite({
                texture: Assets.get(onlineUser),
                anchor: {x: 0, y: .5},
                x: -container.width / 2 + 25,
                y: container.height / 4,
            }));

            const duration = 1.5;

            view.alpha = 0;
            const anim = gsap.timeline({
                repeat: 1,
                yoyo: true,
            });
            const playAnim = () => {
                setTimeout(() => {
                    anim.play(0);
                }, duration * (onlineUsers.length - .5 - i) * 1000);
            };

            anim.to(view, {
                delay: duration * i,
                duration: duration / 2,
                pixi: { alpha: 1 },
                onComplete: playAnim
            });
            anim.play();
        });

        return this.usersScreen = container;
    }
}
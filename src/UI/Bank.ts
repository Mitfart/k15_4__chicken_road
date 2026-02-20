import * as PIXI from "pixi.js";
import {Assets, Container, Text, Sprite, Graphics} from "pixi.js";

import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import {Game} from "../../plugins/Game/Game.ts";
import {WidgetRoot} from "../../plugins/Game/UI.ts";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import {ScreenContainer} from "../../plugins/Utils/Components/ScreenContainer.ts";
import {AnimatedText} from "../../plugins/Utils/Components/AnimatedText.ts";

// @ts-expect-error API
import Tween = gsap.core.Tween;
import {APP_CONFIG} from "../config.ts";

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);


const bankFont = APP_CONFIG.fontFamily;
const gameTransactions = 3;

const transactionRoot = -90;
const transactionIconSize = 65;
const transactionSpace = 12.5;

export type BankScreen = {
    screen: ScreenContainer,
    balanceText: AnimatedText,
    transactionParams: {
        root: number,
        gap: number,
        width: number,
        innerSize: number,
        padding: { x: number, y: number },
        height: number,
        getTransPos: (i: number) => number
    },
    transactions: { container: Container, value: number }[]
}


export default class Bank {
    private static _bank: BankScreen;


    public static async Show(game: Game, duration: number = 2): Promise<void> {
        const transactionDuration = duration / (gameTransactions + 1); // +1 for Show

        this._bank ??= await this.Construct(game, transactionDuration);

        this._bank.screen.y = APP_CONFIG.designSize.y;
        await Promise.all([
            gsap.to(this._bank.screen, {
                duration: this._bank.screen.animDuration,
                y: APP_CONFIG.designSize.y / 2
            }),
            this._bank.screen.show()
        ]);

        await this.Animate(this._bank, transactionDuration);
    }

    public static async Hide(): Promise<void> {
        this._bank?.screen.hide(() => this._bank.screen.destroy());
    }


    private static async Construct(game: Game, transactionDuration: number): Promise<BankScreen> {
        if (this._bank)
            return this._bank;

        const screen = game.ui.add(new ScreenContainer(transactionDuration), WidgetRoot.CENTER);

        const scrennArt = screen.addChild(new Sprite({
            texture: Assets.get(AssetsDB.texture.Bank),
            anchor: .5
        }));

        const balanceText = screen.addChild(new AnimatedText({
            style: {
                fontFamily: bankFont,
                fill: "#fff",
                fontSize: 50
            },
            anchor: .5,
            y: -325
        }, 0, transactionDuration, '', ' EUR', 2));

        const transData = [
            { icon: AssetsDB.texture.icon_netflix, title: "Netflix", value: -1300 },
            { icon: AssetsDB.texture.icon_amazon, title: "Amazon Prime", value: -43.99 },
            { icon: AssetsDB.texture.icon_uber, title: "Uber", value: -169.39 },
            { icon: AssetsDB.texture.icon_game, title: "Chichen Road", value: 2500 },
            { icon: AssetsDB.texture.icon_game, title: "Chichen Road", value: 2500 },
            { icon: AssetsDB.texture.icon_game, title: "Chichen Road", value: 2000 },
        ];

        const transactionParams = {
            root: transactionRoot,
            innerSize: transactionIconSize,
            gap: transactionSpace,
            padding: { x: transactionSpace, y: transactionSpace },
            width: scrennArt.texture.width - transactionSpace * 2 - 40,
            height: transactionIconSize + transactionSpace * 2,
            getTransPos: (i: number) => {
                return transactionParams.root + (transactionParams.height + transactionParams.gap) * ((transData.length - 1) - i);
            },
            container: Container
        };

        const maskSize = {
            x: scrennArt.texture.width,
            y: scrennArt.texture.height - 160,
        }
        const transactionsMask = screen.addChild(new Graphics()
            .rect(-maskSize.x / 2, -maskSize.y / 2, maskSize.x, maskSize.y)
            .fill('#fff')
        );

        const transactions = transData.map((data, i) => {
            const posY = transactionParams.getTransPos(i);

            const transaction = screen.addChild(new Container());
            transaction.position.set(
                -transactionParams.width / 2,
                posY
            );
            transaction.origin.set(
                transactionParams.width / 2,
                transactionParams.height / 2
            );

            transaction.mask = transactionsMask;

            const icon = transaction.addChild(new Sprite({
                texture: Assets.get(data.icon),
                width: transactionParams.innerSize,
                height: transactionParams.innerSize,
                position: {
                    x: transactionParams.padding.x,
                    y: transactionParams.padding.y
                }
            }));
            icon.mask = transaction.addChild(new Graphics()
                .roundRect(icon.x, icon.y, icon.width, icon.height, 10)
                .fill('#fff')
            );

            transaction.addChild(new Text({
                text: data.title,
                style: {
                    fontFamily: bankFont,
                    fill: "#fff",
                    fontSize: transactionParams.innerSize / 3,
                },
                anchor: { x: 0, y: 1 },
                position: {
                    x: transactionParams.padding.x + transactionParams.innerSize + transactionParams.padding.x,
                    y: transactionParams.height / 2
                }
            }));

            transaction.addChild(new Text({
                text: new Date().toLocaleDateString(),
                style: {
                    fontFamily: bankFont,
                    fill: "#fff",
                    fontSize: transactionParams.innerSize / 5,
                    align: "right"
                },
                anchor: { x: 1, y: 0 },
                position: {
                    x: transactionParams.width - transactionParams.padding.x - transactionParams.padding.x,
                    y: transactionParams.padding.y
                }
            }));

            transaction.addChild(new Text({
                text: data.value > 0 ? `+${data.value.toFixed(2)}` : `-${data.value.toFixed(2)}`,
                style: {
                    fontFamily: bankFont,
                    fill: data.value > 0 ? "#1f995f" : "#c32410",
                    fontSize: transactionParams.innerSize / 2.5,
                    align: "right",
                },
                anchor: { x: 1, y: 1 },
                position: {
                    x: transactionParams.width - transactionParams.padding.x - transactionParams.padding.x,
                    y: transactionParams.height - transactionParams.padding.y
                }
            }));

            return {
                container: transaction,
                value: data.value,
            };
        });


        return {
            screen,
            balanceText,
            transactionParams,
            transactions,
        };
    }


    private static async Animate(bank: BankScreen, transactionDuration: number) {
        let value = 0;

        const tweens: Tween[] = [];

        const length = bank.transactions.length;
        for (let i = 0; i < length - gameTransactions; i++) {
            const trans = bank.transactions[i].container;

            const offset = i + gameTransactions;
            trans.y = bank.transactionParams.getTransPos(offset);

            for (let j = 0; j < gameTransactions; j++) {
                tweens.push(gsap.to(trans, {
                    delay: transactionDuration * j,
                    duration: transactionDuration,
                    ease: "power2.out",
                    y: bank.transactionParams.getTransPos(offset - 1 - j),
                }));
            }
        }

        for (let i = 0; i < gameTransactions; i++) {
            const index = length - gameTransactions + i;
            const transData = bank.transactions[index];
            const trans = transData.container;

            trans.y = bank.transactionParams.getTransPos(length - 1);

            trans.scale.set(0);
            tweens.push(gsap.to(trans, {
                delay: transactionDuration * i,
                duration: transactionDuration,
                ease: "elastic.out",
                scale: 1,
                onStart: () => {
                    bank.balanceText.setValue(value, value += transData.value);
                }
            }));

            for (let j = i + 1; j < gameTransactions; j++) {
                tweens.push(gsap.to(trans, {
                    delay: transactionDuration * j,
                    duration: transactionDuration,
                    ease: "power2.out",
                    y: bank.transactionParams.getTransPos(length - 1 + i - j)
                }));
            }
        }

        await Promise.all(tweens);
    }
}
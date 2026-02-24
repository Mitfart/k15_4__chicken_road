import * as PIXI from "pixi.js";
import {Assets, Container, Graphics, Sprite, Text} from "pixi.js";

import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import {Game} from "../../plugins/Game/Game.ts";
import {WidgetRoot} from "../../plugins/Game/UI.ts";
import {HeaderScreen} from "./Header.ts";
import {ControlsScreen} from "./Contols.ts";
import {APP_CONFIG} from "../config.ts";
import {OnClick} from "../../plugins/Utils/UIEvents.ts";
import {AnimAlpha, Play} from "../../plugins/Utils/Animations.ts";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import {CreateHandTutorial} from "./HandTutorial.ts";

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);

const OVERLAY_ALPHA = 0.75;
const CUTOUT_PADDING = 12;
const OUTLINE_WIDTH = 4;
const OUTLINE_COLOR = 0xffffff;
const CURSOR_SCALE = 1.5;
const STEP_TEXT_SIZE = 36;

/** Туториал, который нужно отключать при показе MainTutorial и возобновлять при скрытии */
export type PausableTutorial = {
    isVisible: () => boolean;
    hide: () => void;
    show: () => void;
};

export type MainTutorialScreen = {
    container: Container;
    show: () => Promise<void>;
    hide: () => Promise<void>;
    setOnShow: (cb: (() => void) | undefined) => void;
    setOnHide: (cb: (() => void) | undefined) => void;
};

export default class MainTutorial {
    private static _tutorial: MainTutorialScreen | null = null;

    public static async Construct(
        game: Game,
        header: HeaderScreen,
        controls: ControlsScreen,
        options?: { onShow?: () => void; onHide?: () => void; otherTutorials?: PausableTutorial[] }
    ): Promise<MainTutorialScreen> {
        if (this._tutorial) return this._tutorial;

        const container = game.ui.add(new Container(), WidgetRoot.CENTER);
        container.sortableChildren = true;
        container.eventMode = "static";

        const overlay = container.addChild(new Graphics());
        overlay.eventMode = "none";

        const overlayMask = container.addChild(new Graphics());
        overlayMask.eventMode = "none";

        const outlineGraphics = container.addChild(new Graphics());
        outlineGraphics.zIndex = 1;
        outlineGraphics.eventMode = "none";

        const closeBtn = container.addChild(new Graphics());
        closeBtn.eventMode = "static";
        closeBtn.cursor = "pointer";

        const closeSize = 84;
        closeBtn
            .roundRect(-closeSize / 2, -closeSize / 2, closeSize, closeSize, closeSize / 4)
            .fill({ color: 0x333333, alpha: 0.9 });

        closeBtn.addChild(
            new Text({
                text: "✕",
                style: {
                    fontFamily: APP_CONFIG.fontFamily,
                    fontSize: closeSize * 0.5,
                    fill: 0xffffff,
                    fontWeight: "bold",
                },
                anchor: 0.5,
            })
        );

        const handTutorialClose = CreateHandTutorial(game, closeBtn, {
            parentContainer: container,
            zIndex: 20,
            rotation: (25 * Math.PI) / 180,
            offsetX: -20,
            offsetY: 35,
            scale: 0.85,
            scalePortrait: 0.6,
        });
        let closeHandTimer: ReturnType<typeof setTimeout> | null = null;

        const cursorTex = Assets.get(AssetsDB.texture.cursor2);
        type TutorialHint = { el: Container; text: string; rotation: number; textSide: "left" | "top"; offsetX?: number; offsetY?: number };
        const tutorialHints: TutorialHint[] = [
            { el: header.balanceBlock, text: "1/4 YOUR DEPOSIT", rotation: (20 * Math.PI) / 180, textSide: "left",offsetX : -100, offsetY: 300 },
            { el: controls.topPanel, text: "2/4 CHOOSE BET", rotation: Math.PI, textSide: "top",offsetX : 0, offsetY: -300 },
            { el: controls.playBtn, text: '3/4 TAP "GO" TO MOVE CHICKEN FORWARD', rotation: Math.PI, textSide: "top",offsetX : 0, offsetY: -300 },
            { el: controls.cashBtn, text: "4/4 DONT MISS CASHOUT", rotation: (135 * Math.PI) / 180, textSide: "left",offsetX : -300, offsetY: -300 },
        ];

        const cursors: Sprite[] = [];
        const hintTexts: Text[] = [];
        for (let i = 0; i < tutorialHints.length; i++) {
            const cursor = container.addChild(new Sprite({
                texture: cursorTex,
                anchor: { x: 0.5, y: 1 },
                scale: CURSOR_SCALE,
            }));
            cursor.zIndex = 15;
            cursor.eventMode = "none";
            cursors.push(cursor);

            const text = container.addChild(new Text({
                text: "",
                style: {
                    fontFamily: APP_CONFIG.fontFamily,
                    fontSize: STEP_TEXT_SIZE,
                    fontWeight: "bold",
                    fill: "#ffffff",
                    align: "center",
                },
                anchor: { x: 0.5, y: 0.5 },
            }));
            text.zIndex = 16;
            text.eventMode = "none";
            hintTexts.push(text);
        }

        const reopenSize = 72;
        const reopenBtn = container.addChild(new Graphics());
        reopenBtn.zIndex = 10;
        reopenBtn.eventMode = "static";
        reopenBtn.cursor = "pointer";
        reopenBtn
            .roundRect(-reopenSize / 2, -reopenSize / 2, reopenSize, reopenSize, reopenSize / 4)
            .fill({ color: 0x555555, alpha: 0.9 });
        reopenBtn.addChild(
            new Text({
                text: "?",
                style: {
                    fontFamily: APP_CONFIG.fontFamily,
                    fontSize: reopenSize * 0.55,
                    fontWeight: "bold",
                    fill: "#fff",
                },
                anchor: 0.5,
            })
        );

        const updateLayout = () => {
            const rw = game.resizer.realWidth;
            const rh = game.resizer.realHeight;

            overlay.clear();
            overlayMask.clear();
            outlineGraphics.clear();

            overlay
                .rect(-rw / 2, -rh / 2, rw, rh)
                .fill({ color: 0x000000, alpha: OVERLAY_ALPHA });

            overlayMask.rect(-rw / 2, -rh / 2, rw, rh).fill(0xffffff);

            const elementsToHighlight = [
                { el: header.container, outline: false },
                ...tutorialHints.map((h) => ({ el: h.el, outline: true })),
            ];

            for (const { el, outline } of elementsToHighlight) {
                const b = el.getBounds(false);
                const w = b.maxX - b.minX;
                const h = b.maxY - b.minY;
                if (w < 1 || h < 1) continue;

                const tl = container.toLocal({ x: b.minX, y: b.minY });
                const br = container.toLocal({ x: b.maxX, y: b.maxY });

                const pad = CUTOUT_PADDING;
                const px = Math.min(tl.x, br.x) - pad;
                const py = Math.min(tl.y, br.y) - pad;
                const pw = Math.abs(br.x - tl.x) + pad * 2;
                const ph = Math.abs(br.y - tl.y) + pad * 2;
                const radius = Math.min(12, Math.min(pw, ph) / 4);

                overlayMask.roundRect(px, py, pw, ph, radius).cut();

                if (outline) {
                    outlineGraphics
                        .roundRect(px, py, pw, ph, radius)
                        .stroke({
                            width: OUTLINE_WIDTH,
                            color: OUTLINE_COLOR,
                            alignment: 0,
                            join: "round",
                        });
                }
            }

            overlay.mask = overlayMask;

            const tipOffset = 50;
            for (let i = 0; i < tutorialHints.length; i++) {
                const step = tutorialHints[i];
                const cursor = cursors[i];
                const hintText = hintTexts[i];
                const stepBounds = step.el.getBounds(false);
                const stepCenter = container.toLocal({
                    x: (stepBounds.minX + stepBounds.maxX) / 2,
                    y: (stepBounds.minY + stepBounds.maxY) / 2,
                });
                const stepW = stepBounds.maxX - stepBounds.minX;
                const stepH = stepBounds.maxY - stepBounds.minY;

                cursor.rotation = step.rotation;
                hintText.text = step.text;

                const offsetX = step.offsetX ?? 0;
                const offsetY = step.offsetY ?? 0;
                if (step.textSide === "left") {
                    cursor.position.set(stepCenter.x + stepW / 2 + tipOffset + offsetX, stepCenter.y + offsetY);
                    hintText.anchor.set(1, 0.5);
                    hintText.position.set(cursor.x - cursor.width, cursor.y);
                } else {
                    cursor.position.set(stepCenter.x + offsetX, stepCenter.y - stepH / 2 - tipOffset + offsetY);
                    hintText.anchor.set(0.5, 1);
                    hintText.position.set(cursor.x, cursor.y - cursor.height - 15);
                }
            }

            const headerHeight = 150 + 150 / 4;
            const cornerX = rw / 2 - 16;
            const cornerY = -rh / 2 + headerHeight - 8;
            closeBtn.position.set(cornerX - closeSize / 2, cornerY + closeSize / 2);
            reopenBtn.position.set(cornerX - reopenSize / 2, cornerY + reopenSize / 2);
        };

        game.resizer.addResizeAction(updateLayout);
        updateLayout();

        let isVisible = false;
        let onShowCb: (() => void) | undefined = options?.onShow;
        let onHideCb: (() => void) | undefined = options?.onHide;
        const otherTutorials = options?.otherTutorials ?? [];
        let tutorialsToRestore: PausableTutorial[] = [];

        const show = async () => {
            if (isVisible) return;
            isVisible = true;
            tutorialsToRestore = [];
            for (const t of otherTutorials) {
                if (t.isVisible()) {
                    tutorialsToRestore.push(t);
                    t.hide();
                }
            }
            if (closeHandTimer) clearTimeout(closeHandTimer);
            closeHandTimer = null;
            handTutorialClose.hide();
            container.visible = true;
            overlay.visible = true;
            overlayMask.visible = true;
            outlineGraphics.visible = true;
            cursors.forEach((c) => (c.visible = true));
            hintTexts.forEach((t) => (t.visible = true));
            reopenBtn.visible = false;
            closeBtn.visible = true;
            container.alpha = 0;
            updateLayout();
            await Play(AnimAlpha(container, { from: 0, to: 1 }, 0.3))();
            updateLayout();
            onShowCb?.();
            closeHandTimer = setTimeout(() => handTutorialClose.show(), 3000);
        };

        const hide = async () => {
            if (!isVisible) return;
            isVisible = false;
            if (closeHandTimer) {
                clearTimeout(closeHandTimer);
                closeHandTimer = null;
            }
            handTutorialClose.hide();
            await Play(AnimAlpha(container, { from: 1, to: 0 }, 0.25))();
            overlay.visible = false;
            overlayMask.visible = false;
            outlineGraphics.visible = false;
            cursors.forEach((c) => (c.visible = false));
            hintTexts.forEach((t) => (t.visible = false));
            closeBtn.visible = false;
            reopenBtn.visible = true;
            container.alpha = 1;
            for (const t of tutorialsToRestore) {
                t.show();
            }
            tutorialsToRestore = [];
            onHideCb?.();
        };

        const setOnShow = (cb: (() => void) | undefined) => {
            onShowCb = cb;
        };
        const setOnHide = (cb: (() => void) | undefined) => {
            onHideCb = cb;
        };

        OnClick(closeBtn, hide);
        OnClick(reopenBtn, show);

        container.visible = false;

        return (this._tutorial = {
            container,
            show,
            hide,
            setOnShow,
            setOnHide,
        });
    }

    public static get(): MainTutorialScreen | null {
        return this._tutorial;
    }

    public static Show(
        game: Game,
        header: HeaderScreen,
        controls: ControlsScreen,
        options?: { onShow?: () => void; onHide?: () => void; otherTutorials?: PausableTutorial[] }
    ): Promise<void> {
        return this.Construct(game, header, controls, options).then((t) => t.show());
    }
}
